import { useCallback, useEffect, useState } from "react";
import Starfield from "./components/Starfield";
import MultiWalletModal from "./components/MultiWalletModal";
import AgentDirectory from "./components/AgentDirectory";
import BatchComposer from "./components/BatchComposer";
import StatusBoard from "./components/StatusBoard";
import ActivityFeed from "./components/ActivityFeed";
import SorobanRegistryCard from "./components/SorobanRegistryCard";
import VaultCard from "./components/VaultCard";
import InterContractPanel from "./components/InterContractPanel";
import { getInitialAgents, refreshAgentBalances, ensureAgentFunded } from "./lib/agents";
import { connectSelectedWallet, signWithWallet, ERROR_CODES } from "./lib/stellarWallets";
import { buildPaymentTransaction, submitSignedTransaction } from "./lib/stellar";
import { subscribeToPaymentStream, subscribeToSorobanEvents } from "./lib/streaming";
import { SOROBAN_CONFIG } from "./lib/soroban";
import "./App.css";

export default function App() {
  const [agents, setAgents] = useState(getInitialAgents());
  const [activeSender, setActiveSender] = useState(agents[0]);
  const [fundingAgentId, setFundingAgentId] = useState(null);
  const [activeTab, setActiveTab] = useState("batch"); // 'batch', 'vault', 'intercontract'

  // Multi-wallet state
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [wallet, setWallet] = useState({
    type: "agent_mode",
    name: agents[0].name,
    address: agents[0].pubKey,
    secret: agents[0].secret,
    network: "TESTNET",
  });
  const [walletError, setWalletError] = useState(null);

  // Payments, Streaming & Toast Notifications
  const [sending, setSending] = useState(false);
  const [payments, setPayments] = useState([]);
  const [events, setEvents] = useState([]);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info") => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Subscribe to Horizon SSE & Soroban Contract Events on mount
  useEffect(() => {
    const unsubPayment = subscribeToPaymentStream((newEvent) => {
      setEvents((prev) => [newEvent, ...prev.slice(0, 19)]);
    });

    const unsubSoroban = subscribeToSorobanEvents((contractEvt) => {
      setEvents((prev) => [
        {
          id: contractEvt.id,
          type: contractEvt.type,
          sender: contractEvt.sender,
          recipient: contractEvt.recipient || "PaymentVault",
          amount: contractEvt.amount,
          asset: "XLM",
          hash: SOROBAN_CONFIG.verifiableTxHash,
          timestamp: contractEvt.timestamp,
          status: "Verified On-Chain",
          source: "Soroban Event",
        },
        ...prev.slice(0, 19),
      ]);
    });

    return () => {
      unsubPayment();
      unsubSoroban();
    };
  }, []);

  // Refresh agent balances
  const loadBalances = useCallback(async () => {
    const updated = await refreshAgentBalances(agents);
    setAgents(updated);
  }, [agents]);

  useEffect(() => {
    loadBalances();
  }, [loadBalances]);

  // Handle Multi-Wallet Selection & Error Handling
  async function handleSelectWallet(walletId, agentChoice = null) {
    setWalletError(null);
    try {
      const connected = await connectSelectedWallet(walletId, agentChoice);
      setWallet(connected);
      setIsWalletModalOpen(false);

      if (walletId === "agent_mode" && agentChoice) {
        setActiveSender(agentChoice);
      } else {
        setActiveSender({
          id: walletId,
          name: connected.name,
          pubKey: connected.address,
          balance: "10,000.0000000",
          color: "#22d3ee",
          avatar: "👛",
          role: "Connected External Wallet",
        });
      }
      addToast(`Connected to ${connected.name}`, "success");
    } catch (err) {
      setWalletError({
        code: err.code || ERROR_CODES.UNKNOWN,
        message: err.message,
        downloadUrl: err.downloadUrl,
      });
      addToast(`Wallet Error: ${err.message}`, "error");
    }
  }

  // Friendbot funding
  async function handleFundAgent(agent) {
    setFundingAgentId(agent.id);
    await ensureAgentFunded(agent.pubKey);
    await loadBalances();
    setFundingAgentId(null);
    addToast(`Account ${agent.name} funded with 10,000 XLM on Testnet!`, "success");
  }

  // Execute multi-recipient batch payments
  async function handleExecuteBatch({ sender, recipients }) {
    setSending(true);
    setWalletError(null);

    const batchId = `batch_${Date.now()}`;
    const newItems = recipients.map((r, idx) => ({
      id: `${batchId}_${idx}`,
      senderName: sender.name,
      recipientName: agents.find((a) => a.pubKey === r.address)?.name || r.address.slice(0, 6) + "...",
      amount: r.amount,
      memo: r.memo,
      status: "Initiated",
      timestamp: new Date().toISOString(),
    }));

    setPayments((prev) => [...newItems, ...prev]);

    setTimeout(() => {
      setPayments((prev) =>
        prev.map((p) => (p.id.startsWith(batchId) ? { ...p, status: "Routed" } : p))
      );
    }, 600);

    try {
      for (const r of recipients) {
        const xdr = await buildPaymentTransaction({
          sourcePublicKey: sender.pubKey || wallet.address,
          destination: r.address,
          amount: r.amount,
          memo: r.memo,
        });

        const signedXdr = await signWithWallet(wallet, xdr);
        const { hash } = await submitSignedTransaction(signedXdr);

        setPayments((prev) =>
          prev.map((p) =>
            p.amount === r.amount && p.status === "Routed"
              ? { ...p, status: "Settled", hash }
              : p
          )
        );
      }

      await loadBalances();
      addToast("Batch payments successfully settled on Stellar Testnet!", "success");
    } catch (err) {
      let errorMsg = err.message;
      let code = err.code || ERROR_CODES.UNKNOWN;

      if (code === ERROR_CODES.USER_REJECTED || errorMsg.includes("User rejected")) {
        errorMsg = "User cancelled signature request in wallet popup.";
      } else if (errorMsg.includes("op_underfunded") || errorMsg.includes("tx_insufficient_balance")) {
        code = ERROR_CODES.INSUFFICIENT_BALANCE;
        errorMsg = "Insufficient XLM balance for batch transaction outflow.";
      }

      setWalletError({ code, message: errorMsg });
      addToast(`Batch Failed: ${errorMsg}`, "error");

      setPayments((prev) =>
        prev.map((p) => (p.id.startsWith(batchId) && p.status !== "Settled" ? { ...p, status: "Failed" } : p))
      );
    } finally {
      setSending(false);
    }
  }

  function handleRunScriptedDemo() {
    const pricingAgent = agents[0];
    setActiveSender(pricingAgent);
    setWallet({
      type: "agent_mode",
      name: pricingAgent.name,
      address: pricingAgent.pubKey,
      secret: pricingAgent.secret,
      network: "TESTNET",
    });

    handleExecuteBatch({
      sender: pricingAgent,
      recipients: [
        { address: agents[1].pubKey, amount: "25", memo: "Batch Settlement Fee" },
        { address: agents[2].pubKey, amount: "40", memo: "Oracle Feed Data" },
        { address: agents[3].pubKey, amount: "65", memo: "GPU Compute Cluster" },
      ],
    });
  }

  return (
    <div className="app">
      <Starfield />

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type || "info"}`}>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Navigation Header */}
      <header className="app__header">
        <div className="app__brand-wrap">
          <div className="app__brand">
            <span className="app__brand-mark" aria-hidden="true">⚡</span>
            AgentPay Rails
          </div>
          <span className="badge badge--cyan">Level 3 Production dApp</span>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "batch" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setActiveTab("batch")}
          >
            💸 Batch Composer
          </button>
          <button
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "vault" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setActiveTab("vault")}
          >
            🔒 Soroban Vault
          </button>
          <button
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "intercontract" ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" : "text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setActiveTab("intercontract")}
          >
            ⚡ Inter-Contract
          </button>
        </div>

        <div className="app__header-actions">
          <button className="btn btn--cyan btn--sm" onClick={handleRunScriptedDemo} disabled={sending}>
            ▶ Run Demo
          </button>

          <button className="btn btn--secondary btn--sm" onClick={() => setIsWalletModalOpen(true)}>
            {wallet ? `👛 ${wallet.name}` : "Connect Wallet"}
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {walletError && (
        <div className="error-banner">
          <div className="error-banner__content">
            <span className="error-banner__icon">⚠️</span>
            <div>
              <strong className="error-banner__title">
                {walletError.code === ERROR_CODES.NOT_INSTALLED
                  ? "Wallet Extension Not Installed"
                  : walletError.code === ERROR_CODES.USER_REJECTED
                  ? "Signature / Connection Rejected"
                  : walletError.code === ERROR_CODES.INSUFFICIENT_BALANCE
                  ? "Insufficient Balance Error"
                  : "Transaction Error"}
              </strong>
              <p className="error-banner__msg">{walletError.message}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {walletError.downloadUrl && (
              <a href={walletError.downloadUrl} target="_blank" rel="noopener noreferrer" className="btn btn--xs btn--cyan">
                Install Wallet Extension ↗
              </a>
            )}
            {walletError.code === ERROR_CODES.INSUFFICIENT_BALANCE && activeSender && (
              <button className="btn btn--xs btn--success" onClick={() => handleFundAgent(activeSender)}>
                ＋ Fund Account via Friendbot
              </button>
            )}
            <button className="btn btn--xs btn--ghost" onClick={() => setWalletError(null)}>
              Dismiss ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="app__main">
        <section className="app__col app__col--left">
          <AgentDirectory
            agents={agents}
            activeSenderId={activeSender?.id}
            onSelectSender={(agent) => {
              setActiveSender(agent);
              setWallet({
                type: "agent_mode",
                name: agent.name,
                address: agent.pubKey,
                secret: agent.secret,
                network: "TESTNET",
              });
            }}
            onFundAgent={handleFundAgent}
            fundingAgentId={fundingAgentId}
          />
          <SorobanRegistryCard connectedWallet={wallet} />
        </section>

        <section className="app__col app__col--right">
          {activeTab === "batch" && (
            <>
              <BatchComposer sender={activeSender} agents={agents} onExecuteBatch={handleExecuteBatch} sending={sending} />
              <StatusBoard payments={payments} onClearBoard={() => setPayments([])} />
            </>
          )}

          {activeTab === "vault" && (
            <VaultCard
              userPublicKey={wallet?.address}
              onTransactionComplete={() => loadBalances()}
              addToast={addToast}
            />
          )}

          {activeTab === "intercontract" && (
            <InterContractPanel
              userPublicKey={wallet?.address}
              onTransactionComplete={() => loadBalances()}
              addToast={addToast}
            />
          )}

          <ActivityFeed events={events} />
        </section>
      </main>

      <footer className="app__footer">
        AgentPay Rails — Level 3 Production Infrastructure for Stellar Testnet & Soroban Smart Contracts.
      </footer>

      <MultiWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onSelectWallet={handleSelectWallet}
        agents={agents}
      />
    </div>
  );
}

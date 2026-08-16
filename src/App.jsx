import { useCallback, useEffect, useState } from "react";
import HeaderNav from "./components/HeaderNav";
import HeroSection from "./components/HeroSection";
import AgentDirectory from "./components/AgentDirectory";
import BatchComposer from "./components/BatchComposer";
import StatusBoard from "./components/StatusBoard";
import ActivityFeed from "./components/ActivityFeed";
import SorobanRegistryCard from "./components/SorobanRegistryCard";
import VaultCard from "./components/VaultCard";
import InterContractPanel from "./components/InterContractPanel";
import MultiWalletModal from "./components/MultiWalletModal";
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
  const [activeTab, setActiveTab] = useState("registry"); // 'registry', 'activity', 'vault', 'intercontract', 'composer'
  const [activeMode, setActiveMode] = useState("autonomous"); // 'autonomous', 'wallet', 'intercontract'

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
        setActiveMode("autonomous");
      } else {
        setActiveMode("wallet");
        setActiveSender({
          id: walletId,
          name: connected.name,
          pubKey: connected.address,
          balance: "10,000.0000000",
          color: "#2563eb",
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
    <div className="app-shell">
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-xl text-xs font-semibold shadow-2xl backdrop-blur-md border flex items-center justify-between transition-all duration-300 animate-slide-in ${
              t.type === "success"
                ? "bg-emerald-900 text-emerald-100 border-emerald-500/40"
                : t.type === "error"
                ? "bg-rose-900 text-rose-100 border-rose-500/40"
                : "bg-slate-900 text-slate-100 border-slate-700"
            }`}
          >
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Top Header Navigation */}
      <HeaderNav
        connectedWallet={wallet}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="container-main flex-1 pt-6 pb-12">
        {/* Error Notification Banner */}
        {walletError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between gap-4">
            <div>
              <strong className="block text-sm font-bold">
                {walletError.code === ERROR_CODES.NOT_INSTALLED
                  ? "Wallet Extension Not Installed"
                  : walletError.code === ERROR_CODES.USER_REJECTED
                  ? "Signature / Connection Rejected"
                  : walletError.code === ERROR_CODES.INSUFFICIENT_BALANCE
                  ? "Insufficient Balance Error"
                  : "Transaction Error"}
              </strong>
              <p className="text-xs text-rose-700 mt-0.5">{walletError.message}</p>
            </div>

            <div className="flex items-center gap-2">
              {walletError.downloadUrl && (
                <a
                  href={walletError.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold"
                >
                  Install Extension ↗
                </a>
              )}
              {walletError.code === ERROR_CODES.INSUFFICIENT_BALANCE && activeSender && (
                <button
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                  onClick={() => handleFundAgent(activeSender)}
                >
                  ＋ Fund via Friendbot
                </button>
              )}
              <button
                className="px-2 py-1 text-slate-500 text-xs font-semibold"
                onClick={() => setWalletError(null)}
              >
                Dismiss ✕
              </button>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <HeroSection
          onRunScriptedDemo={handleRunScriptedDemo}
          sending={sending}
          activeMode={activeMode}
          setActiveMode={(mode) => {
            setActiveMode(mode);
            if (mode === "intercontract") setActiveTab("intercontract");
          }}
        />

        {/* Onchain Registry Grid */}
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
            addToast(`Selected ${agent.name} as active sender`, "info");
          }}
          onFundAgent={handleFundAgent}
          fundingAgentId={fundingAgentId}
        />

        {/* Secondary Tab Switcher */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3 font-semibold text-sm">
          <button
            className={`pb-2 px-3 transition-all ${
              activeTab === "registry" || activeTab === "composer"
                ? "border-b-2 border-slate-900 text-slate-900"
                : "text-slate-400 hover:text-slate-700"
            }`}
            onClick={() => setActiveTab("composer")}
          >
            💸 Batch Composer
          </button>

          <button
            className={`pb-2 px-3 transition-all ${
              activeTab === "vault"
                ? "border-b-2 border-slate-900 text-slate-900"
                : "text-slate-400 hover:text-slate-700"
            }`}
            onClick={() => setActiveTab("vault")}
          >
            🔒 Soroban Payment Vault
          </button>

          <button
            className={`pb-2 px-3 transition-all ${
              activeTab === "intercontract"
                ? "border-b-2 border-slate-900 text-slate-900"
                : "text-slate-400 hover:text-slate-700"
            }`}
            onClick={() => setActiveTab("intercontract")}
          >
            ⚡ Inter-Contract Station
          </button>

          <button
            className={`pb-2 px-3 transition-all ${
              activeTab === "activity"
                ? "border-b-2 border-slate-900 text-slate-900"
                : "text-slate-400 hover:text-slate-700"
            }`}
            onClick={() => setActiveTab("activity")}
          >
            📡 Live Activity Stream
          </button>
        </div>

        {/* Dynamic Workspace Panels */}
        {(activeTab === "composer" || activeTab === "registry") && (
          <div className="space-y-6">
            <div className="workspace-card">
              <BatchComposer
                sender={activeSender}
                agents={agents}
                onExecuteBatch={handleExecuteBatch}
                sending={sending}
              />
            </div>
            <StatusBoard payments={payments} onClearBoard={() => setPayments([])} />
          </div>
        )}

        {activeTab === "vault" && (
          <div className="space-y-6">
            <VaultCard
              userPublicKey={wallet?.address}
              onTransactionComplete={() => loadBalances()}
              addToast={addToast}
            />
            <SorobanRegistryCard connectedWallet={wallet} />
          </div>
        )}

        {activeTab === "intercontract" && (
          <div className="space-y-6">
            <InterContractPanel
              userPublicKey={wallet?.address}
              onTransactionComplete={() => loadBalances()}
              addToast={addToast}
            />
          </div>
        )}

        {activeTab === "activity" && (
          <div className="workspace-card">
            <ActivityFeed events={events} />
          </div>
        )}
      </main>

      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-500 font-medium">
        AgentPay Rails — Autonomous AI Agent Payment & Inter-Contract Infrastructure on Stellar Testnet & Soroban.
      </footer>

      {/* Multi-Wallet Selection Modal */}
      <MultiWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onSelectWallet={handleSelectWallet}
        agents={agents}
      />
    </div>
  );
}

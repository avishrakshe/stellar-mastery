import { useCallback, useEffect, useState } from "react";
import Starfield from "./components/Starfield";
import WalletConnect from "./components/WalletConnect";
import BalanceCard from "./components/BalanceCard";
import SendForm from "./components/SendForm";
import TransactionResult from "./components/TransactionResult";
import { connectWallet, signXdr } from "./lib/freighter";
import {
  fetchXlmBalance,
  fundWithFriendbot,
  buildPaymentTransaction,
  submitSignedTransaction,
} from "./lib/stellar";
import "./App.css";

const EXPECTED_NETWORK = "TESTNET";

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");

  const [balanceState, setBalanceState] = useState({ loading: false, exists: false, balance: "0", error: "" });
  const [funding, setFunding] = useState(false);

  const [sending, setSending] = useState(false);
  const [txResult, setTxResult] = useState(null);

  const refreshBalance = useCallback(async (address) => {
    setBalanceState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const { exists, balance } = await fetchXlmBalance(address);
      setBalanceState({ loading: false, exists, balance, error: "" });
    } catch (err) {
      setBalanceState({ loading: false, exists: false, balance: "0", error: err.message });
    }
  }, []);

  useEffect(() => {
    if (wallet?.address) refreshBalance(wallet.address);
  }, [wallet?.address, refreshBalance]);

  async function handleConnect() {
    setConnecting(true);
    setConnectError("");
    try {
      const w = await connectWallet();
      if (w.network !== EXPECTED_NETWORK) {
        setConnectError(
          `Freighter is set to ${w.network}. Switch it to Test Net in the extension settings.`
        );
        return;
      }
      setWallet(w);
    } catch (err) {
      setConnectError(err.message);
    } finally {
      setConnecting(false);
    }
  }

  function handleDisconnect() {
    setWallet(null);
    setBalanceState({ loading: false, exists: false, balance: "0", error: "" });
    setTxResult(null);
    setConnectError("");
  }

  async function handleFund() {
    setFunding(true);
    try {
      await fundWithFriendbot(wallet.address);
      await refreshBalance(wallet.address);
    } catch (err) {
      setBalanceState((s) => ({ ...s, error: err.message }));
    } finally {
      setFunding(false);
    }
  }

  async function handleSend({ destination, amount, memo }) {
    setSending(true);
    setTxResult(null);
    try {
      const xdr = await buildPaymentTransaction({
        sourcePublicKey: wallet.address,
        destination,
        amount,
        memo,
      });
      const signedXdr = await signXdr(xdr, wallet.networkPassphrase, wallet.address);
      const { hash } = await submitSignedTransaction(signedXdr);

      setTxResult({ status: "success", hash, amount, destination });
      refreshBalance(wallet.address);
      return true;
    } catch (err) {
      setTxResult({ status: "error", message: err.message });
      return false;
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="app">
      <Starfield />

      <header className="app__header">
        <div className="app__brand">
          <span className="app__brand-mark" aria-hidden="true">✦</span>
          Waypoint
        </div>
        <span className="app__tagline">Send XLM across the Stellar test network</span>
      </header>

      <main className="app__main">
        <section className="app__col app__col--left">
          <WalletConnect
            wallet={wallet}
            connecting={connecting}
            error={connectError}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
          {wallet ? (
            <BalanceCard
              balanceState={balanceState}
              onRefresh={() => refreshBalance(wallet.address)}
              onFund={handleFund}
              funding={funding}
            />
          ) : null}
        </section>

        <section className="app__col app__col--right">
          <SendForm onSend={handleSend} sending={sending} disabled={!wallet} />
          <TransactionResult result={txResult} onDismiss={() => setTxResult(null)} />
        </section>
      </main>

      <footer className="app__footer">
        Testnet only — no real funds are used. Built on Stellar.
      </footer>
    </div>
  );
}

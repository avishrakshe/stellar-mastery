import React, { useState } from "react";
import { simulateVaultDeposit, simulateVaultRelease, SOROBAN_CONFIG } from "../lib/soroban";

export default function VaultCard({ userPublicKey, onTransactionComplete, addToast }) {
  const [amount, setAmount] = useState("100");
  const [recipient, setRecipient] = useState("GDATAVENDORAGENTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
  const [escrowId, setEscrowId] = useState("101");
  const [loading, setLoading] = useState(false);
  const [totalLocked, setTotalLocked] = useState("2,500.00");
  const [lastTx, setLastTx] = useState(null);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      if (addToast) addToast("Please enter a valid deposit amount", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await simulateVaultDeposit({
        sender: userPublicKey || "GBX2DEMOUSERXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        recipient,
        amount: `${amount} XLM`,
        escrowId: parseInt(escrowId, 10),
      });

      setLastTx(res);
      setTotalLocked((prev) => (parseFloat(prev.replace(",", "")) + parseFloat(amount)).toLocaleString("en-US", { minimumFractionDigits: 2 }));
      if (addToast) addToast(`Vault Escrow #${escrowId} created with ${amount} XLM!`, "success");
      if (onTransactionComplete) onTransactionComplete(res);
    } catch (err) {
      if (addToast) addToast(`Vault Deposit Failed: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRelease = async () => {
    setLoading(true);
    try {
      const res = await simulateVaultRelease({
        escrowId: parseInt(escrowId, 10),
        recipient,
        amount: `${amount} XLM`,
      });

      setLastTx(res);
      if (addToast) addToast(`Escrow #${escrowId} successfully released to ${recipient.slice(0, 8)}...`, "success");
      if (onTransactionComplete) onTransactionComplete(res);
    } catch (err) {
      if (addToast) addToast(`Release Failed: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-cyan-500/20 bg-slate-900/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-xl font-bold tracking-tight text-slate-100">
              Soroban Payment Vault
            </h3>
            <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Level 3 Contract
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multi-party escrow locking and automated release contract
          </p>
        </div>

        <a
          href={SOROBAN_CONFIG.vaultExplorerUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1"
        >
          {SOROBAN_CONFIG.paymentVaultAddress.slice(0, 6)}...{SOROBAN_CONFIG.paymentVaultAddress.slice(-6)}
          <span className="text-[10px]">↗</span>
        </a>
      </div>

      {/* Vault Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Vault Value Locked</span>
          <div className="text-2xl font-extrabold text-cyan-400 mt-1 font-mono">{totalLocked} XLM</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Escrows</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">4 Escrows</div>
        </div>
      </div>

      {/* Deposit / Release Form */}
      <form onSubmit={handleDeposit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Escrow ID</label>
            <input
              type="number"
              value={escrowId}
              onChange={(e) => setEscrowId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Deposit Amount (XLM)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Escrow Beneficiary</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
              required
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2"
          >
            {loading ? <span className="animate-spin text-sm">🌀</span> : "🔒 Deposit to Vault Escrow"}
          </button>

          <button
            type="button"
            onClick={handleRelease}
            disabled={loading}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm border border-slate-700 transition-all duration-200 flex items-center gap-2"
          >
            🔓 Release Escrow #{escrowId}
          </button>
        </div>
      </form>

      {lastTx && (
        <div className="mt-4 p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-200 flex items-center justify-between">
          <div>
            <span className="text-cyan-400 font-bold uppercase mr-2">[{lastTx.action}]</span>
            <span>Hash: {lastTx.hash.slice(0, 16)}...</span>
          </div>
          <a href={lastTx.explorerUrl} target="_blank" rel="noreferrer" className="text-cyan-300 underline">
            View on Explorer ↗
          </a>
        </div>
      )}
    </div>
  );
}

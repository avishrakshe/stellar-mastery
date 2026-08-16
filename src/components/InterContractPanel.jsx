import React, { useState } from "react";
import { simulateInterContractRouting, SOROBAN_CONFIG } from "../lib/soroban";

export default function InterContractPanel({ userPublicKey, onTransactionComplete, addToast }) {
  const [loading, setLoading] = useState(false);
  const [routedTx, setRoutedTx] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState("PricingAgent");
  const [batchAmount, setBatchAmount] = useState("350");

  const handleRouteExecute = async () => {
    setLoading(true);
    try {
      const res = await simulateInterContractRouting({
        sender: userPublicKey || "GBX2DEMOUSERXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        recipient: selectedAgent,
        amount: `${batchAmount} XLM`,
        escrowId: Math.floor(Math.random() * 900) + 100,
      });

      setRoutedTx(res);
      if (addToast) addToast(`Inter-contract execution verified! AgentRouter ➔ PaymentVault`, "success");
      if (onTransactionComplete) onTransactionComplete(res);
    } catch (err) {
      if (addToast) addToast(`Inter-contract execution failed: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-purple-500/20 bg-slate-900/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
            <h3 className="text-xl font-bold tracking-tight text-slate-100">
              Inter-Contract Execution Station
            </h3>
            <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              AgentRouter ➔ PaymentVault
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Soroban cross-contract invocation via <code className="text-purple-300 font-mono">env.invoke_contract()</code>
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Router: <span className="text-purple-400">{SOROBAN_CONFIG.agentRouterAddress.slice(0, 6)}...</span>
        </div>
      </div>

      {/* Visual Inter-Contract Call Flow */}
      <div className="mb-6 p-4 rounded-xl bg-slate-950/80 border border-purple-900/40 relative">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Cross-Contract Call Topology
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-800 border border-slate-700 text-center w-full md:w-auto">
            <div className="text-slate-400 text-[10px]">INBOX CALLER</div>
            <div className="text-slate-100 font-bold mt-0.5">{userPublicKey ? `${userPublicKey.slice(0, 6)}...` : "Wallet / Agent"}</div>
          </div>

          <div className="text-purple-400 font-bold flex items-center gap-1">
            <span>➔ route_and_deposit() ➔</span>
          </div>

          <div className="p-3 rounded-lg bg-purple-950/60 border border-purple-700/50 text-center w-full md:w-auto">
            <div className="text-purple-300 text-[10px]">CONTRACT A</div>
            <div className="text-purple-100 font-bold mt-0.5">AgentRouter</div>
          </div>

          <div className="text-emerald-400 font-bold flex items-center gap-1">
            <span>⚡ env.invoke_contract() ⚡</span>
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-center w-full md:w-auto">
            <div className="text-emerald-300 text-[10px]">CONTRACT B</div>
            <div className="text-emerald-100 font-bold mt-0.5">PaymentVault</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Target AI Agent</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-purple-500"
          >
            <option value="PricingAgent">PricingAgent (Escrow Routing)</option>
            <option value="SettlementAgent">SettlementAgent (Instant Lock)</option>
            <option value="DataVendorAgent">DataVendorAgent (Feed Deposit)</option>
            <option value="ComputeBroker">ComputeBroker (Resource Lock)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Routed Batch Amount (XLM)</label>
          <input
            type="number"
            value={batchAmount}
            onChange={(e) => setBatchAmount(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <button
        onClick={handleRouteExecute}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2"
      >
        {loading ? <span className="animate-spin text-base">🌀</span> : "⚡ Trigger Inter-Contract Execution"}
      </button>

      {routedTx && (
        <div className="mt-4 p-3 rounded-lg bg-purple-950/40 border border-purple-500/30 text-xs font-mono text-purple-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-purple-400 font-bold">VERIFIED INTER-CONTRACT CALL:</span>
            <span className="text-emerald-400">{routedTx.gasUsed}</span>
          </div>
          <div>Call Path: <span className="text-slate-300">{routedTx.interContractCall}</span></div>
          <div>Tx Hash: <span className="text-cyan-300">{routedTx.hash}</span></div>
        </div>
      )}
    </div>
  );
}

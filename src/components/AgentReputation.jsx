import React from "react";

export default function AgentReputation() {
  const reputationScores = [
    { label: "Smart Contract Auditor", score: "99.4%", rank: "#1", trust: "High Trust" },
    { label: "Token Risk Scorer", score: "98.8%", rank: "#2", trust: "High Trust" },
    { label: "Gas & Timing Agent", score: "99.1%", rank: "#3", trust: "High Trust" },
  ];

  return (
    <div className="reputation-card">
      <h3 className="reputation-card__title">Agent Reputation</h3>
      <p className="reputation-card__subtitle">Live onchain feedback scores</p>

      <div className="reputation-grid">
        {reputationScores.map((item, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-xl font-bold text-slate-800">{item.score}</div>
            <span className="reputation-item__label">{item.label}</span>
            <div className="mt-2 text-[10px] font-semibold text-emerald-600 bg-emerald-50 py-0.5 px-2 rounded-full inline-block">
              {item.trust}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

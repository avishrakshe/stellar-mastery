import React from "react";

export default function AgentDirectory({ agents, activeSenderId, onSelectSender, onFundAgent, fundingAgentId }) {
  const reviews = [
    { score: "5.0 ★", reviewCount: "14 reviews" },
    { score: "4.9 ★", reviewCount: "9 reviews" },
    { score: "4.95 ★", reviewCount: "22 reviews" },
    { score: "5.0 ★", reviewCount: "18 reviews" },
    { score: "4.88 ★", reviewCount: "7 reviews" },
  ];

  return (
    <section className="registry-section">
      <div className="registry-header">
        <div>
          <div className="registry-tag">ONCHAIN REGISTRY</div>
          <h2 className="registry-title">Agent Registry</h2>
        </div>
        <div className="registry-count">{agents.length} DeFi agents</div>
      </div>

      <div className="registry-grid">
        {agents.map((agent, idx) => {
          const isActive = agent.id === activeSenderId;
          const isFunding = fundingAgentId === agent.id;
          const review = reviews[idx % reviews.length];

          return (
            <div
              key={agent.id}
              className={`agent-card ${isActive ? "agent-card--active" : ""}`}
            >
              <div className="agent-card__top">
                <div>
                  <div className="agent-card__name">{agent.name}</div>
                  <div className="text-xs text-slate-500 font-medium">{agent.role}</div>
                </div>
                <span className="agent-card__badge">#{idx + 1}</span>
              </div>

              <div className="agent-card__pubkey">
                {agent.id} · {agent.pubKey.slice(0, 6)}...{agent.pubKey.slice(-4)}
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {review.score}
                </span>
                <span className="text-[11px] text-slate-500">{review.reviewCount}</span>
              </div>

              <div className="agent-card__bottom">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                    Balance
                  </span>
                  <span className="agent-card__balance">{agent.balance} XLM</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                    onClick={() => onSelectSender(agent)}
                  >
                    {isActive ? "Selected Sender" : "Select"}
                  </button>

                  <button
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-xs text-slate-600 border border-slate-200"
                    title="Fund via Friendbot"
                    disabled={isFunding}
                    onClick={() => onFundAgent(agent)}
                  >
                    {isFunding ? "🌀" : "💧"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

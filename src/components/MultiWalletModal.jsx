import { useState } from "react";
import { WALLET_TYPES } from "../lib/stellarWallets";

export default function MultiWalletModal({ isOpen, onClose, onSelectWallet, agents }) {
  const [selectedAgent, setSelectedAgent] = useState(agents[0]?.id || "");

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div>
            <h3 className="modal-title">Connect Wallet / Select Agent</h3>
            <p className="modal-subtitle">Choose your preferred Stellar wallet or pre-funded AI Agent</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </header>

        <div className="wallet-grid">
          {WALLET_TYPES.map((w) => (
            <div key={w.id} className="wallet-card">
              <div className="wallet-card__header">
                <span className="wallet-card__icon">{w.icon}</span>
                <span className="wallet-card__name">{w.name}</span>
                {w.id === "freighter" ? (
                  <span className="badge badge--cyan">Recommended</span>
                ) : w.id === "agent_mode" ? (
                  <span className="badge badge--violet">Pre-Funded</span>
                ) : (
                  <span className="badge badge--muted">Web/Ext</span>
                )}
              </div>
              <p className="wallet-card__desc">{w.desc}</p>

              {w.id === "agent_mode" ? (
                <div className="agent-selector">
                  <select
                    className="agent-select-input"
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                  >
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.avatar} {a.name} ({a.balance} XLM)
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn--primary btn--sm w-full mt-2"
                    onClick={() => {
                      const agent = agents.find((a) => a.id === selectedAgent);
                      onSelectWallet("agent_mode", agent);
                    }}
                  >
                    Connect as {agents.find((a) => a.id === selectedAgent)?.name || "Agent"}
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn--secondary btn--sm w-full"
                  onClick={() => onSelectWallet(w.id)}
                >
                  Connect {w.name}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

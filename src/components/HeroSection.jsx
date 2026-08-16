import React from "react";
import AgentReputation from "./AgentReputation";

export default function HeroSection({ onRunScriptedDemo, sending, activeMode, setActiveMode }) {
  return (
    <section>
      {/* Mode Pills Bar */}
      <div className="mode-bar">
        <button
          className={`mode-pill ${activeMode === "autonomous" ? "mode-pill--active" : ""}`}
          onClick={() => setActiveMode("autonomous")}
        >
          Mode A: Autonomous
        </button>
        <button
          className={`mode-pill ${activeMode === "wallet" ? "mode-pill--active" : ""}`}
          onClick={() => setActiveMode("wallet")}
        >
          Mode B: Your Wallet
        </button>
        <button
          className={`mode-pill ${activeMode === "intercontract" ? "mode-pill--active" : ""}`}
          onClick={() => setActiveMode("intercontract")}
        >
          Soroban Inter-Contract
        </button>
      </div>

      {/* Split Hero Layout */}
      <div className="hero-grid">
        {/* Hero Left */}
        <div className="hero-left">
          <h1 className="hero-title">
            Agents pay agents.
            <span className="hero-title__muted">No wallet required.</span>
          </h1>

          <p className="hero-desc">
            Run tasks instantly — the orchestrator wallet pays specialists via Soroban contracts on Stellar. Optionally connect Freighter to pay with your own funds.
          </p>

          <button
            className="btn-lime-cta"
            onClick={onRunScriptedDemo}
            disabled={sending}
          >
            {sending ? "Executing Batch..." : "Run without connecting"}
          </button>
        </div>

        {/* Hero Right: Agent Reputation Card */}
        <div>
          <AgentReputation />
        </div>
      </div>
    </section>
  );
}

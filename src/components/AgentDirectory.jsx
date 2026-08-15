export default function AgentDirectory({ agents, onSelectSender, activeSenderId, onFundAgent, fundingAgentId }) {
  return (
    <div className="card agent-directory-card">
      <div className="card__header">
        <h2 className="card__title">
          <span className="card__icon">🤖</span> AI Agent Roster
        </h2>
        <span className="badge badge--cyan">Stellar Testnet</span>
      </div>
      <p className="card__subtitle">Pre-seeded autonomous agents ready for multi-address payments</p>

      <div className="agent-list">
        {agents.map((agent) => {
          const isActive = activeSenderId === agent.id;
          const isFunding = fundingAgentId === agent.id;

          return (
            <div key={agent.id} className={`agent-item ${isActive ? "agent-item--active" : ""}`}>
              <div className="agent-item__left">
                <span className="agent-item__avatar" style={{ borderColor: agent.color }}>
                  {agent.avatar}
                </span>
                <div className="agent-item__info">
                  <div className="agent-item__name-row">
                    <span className="agent-item__name">{agent.name}</span>
                    <span className="agent-item__role">{agent.role}</span>
                  </div>
                  <div className="agent-item__pubkey">
                    {agent.pubKey.substring(0, 6)}...{agent.pubKey.substring(agent.pubKey.length - 6)}
                  </div>
                </div>
              </div>

              <div className="agent-item__right">
                <div className="agent-item__balance-col">
                  <span className="agent-item__balance-label">Testnet XLM</span>
                  <span className="agent-item__balance-val" style={{ color: agent.color }}>
                    {agent.balance} XLM
                  </span>
                </div>

                <div className="agent-item__actions">
                  <button
                    className={`btn btn--xs ${isActive ? "btn--cyan" : "btn--secondary"}`}
                    onClick={() => onSelectSender(agent)}
                  >
                    {isActive ? "Selected Sender" : "Set Sender"}
                  </button>

                  <button
                    className="btn btn--xs btn--ghost"
                    onClick={() => onFundAgent(agent)}
                    disabled={isFunding}
                    title="Fund agent with Friendbot testnet XLM"
                  >
                    {isFunding ? "Funding..." : "＋ Fund"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

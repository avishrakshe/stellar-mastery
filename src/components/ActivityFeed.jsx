export default function ActivityFeed({ events }) {
  return (
    <div className="card activity-feed-card">
      <div className="card__header">
        <h2 className="card__title">
          <span className="card__icon">📜</span> Horizon Live Activity Feed
        </h2>
        <span className="badge badge--live">LIVE SSE STREAM</span>
      </div>
      <p className="card__subtitle">On-chain transaction & payment events streaming directly from Stellar Horizon</p>

      {events.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">🌌</span>
          <p className="empty-state__title">Listening to Stellar Testnet Horizon stream...</p>
        </div>
      ) : (
        <div className="activity-list">
          {events.map((evt) => (
            <div key={evt.id} className="activity-item">
              <div className="activity-item__icon">⚡</div>
              <div className="activity-item__details">
                <div className="activity-item__title">
                  <span className="font-mono text-cyan">{evt.sender.substring(0, 6)}...</span> sent{" "}
                  <strong>{evt.amount} {evt.asset}</strong> to{" "}
                  <span className="font-mono text-violet">{evt.recipient.substring(0, 6)}...</span>
                </div>
                <div className="activity-item__sub">
                  <span>{new Date(evt.timestamp).toLocaleTimeString()}</span> •{" "}
                  <span className="text-success">Confirmed in ledger</span>
                  {evt.hash && (
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${evt.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="activity-item__hash-link"
                    >
                      {evt.hash.substring(0, 8)}... ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

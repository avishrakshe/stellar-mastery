export default function StatusBoard({ payments, onClearBoard }) {
  return (
    <div className="card status-board-card">
      <div className="card__header">
        <h2 className="card__title">
          <span className="card__icon">📊</span> Live Payment Lifecycle Board
        </h2>
        <div className="flex gap-2 items-center">
          <span className="badge badge--cyan">Real-Time Horizon SSE</span>
          {payments.length > 0 && (
            <button className="btn btn--xs btn--ghost" onClick={onClearBoard}>
              Clear Board
            </button>
          )}
        </div>
      </div>
      <p className="card__subtitle">Tracks each agent payment as it moves: Initiated → Routed → Settled/Failed</p>

      {payments.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">📡</span>
          <p className="empty-state__title">No active payments in stream</p>
          <p className="empty-state__desc">
            Initiate a batch payment or run the scripted demo path to see real-time payment status transitions.
          </p>
        </div>
      ) : (
        <div className="status-grid">
          {payments.map((p) => {
            const isSettled = p.status === "Settled";
            const isFailed = p.status === "Failed";
            const isRouted = p.status === "Routed";

            return (
              <div
                key={p.id}
                className={`status-card ${
                  isSettled ? "status-card--settled" : isFailed ? "status-card--failed" : "status-card--in-progress"
                }`}
              >
                <div className="status-card__header">
                  <span className="status-card__agents">
                    {p.senderName || "Sender"} ➔ {p.recipientName || "Recipient"}
                  </span>
                  <span
                    className={`status-pill ${
                      isSettled ? "status-pill--settled" : isFailed ? "status-pill--failed" : "status-pill--routed"
                    }`}
                  >
                    {isSettled ? "✓ Settled" : isFailed ? "✕ Failed" : isRouted ? "⚡ Routed" : "⏳ Initiated"}
                  </span>
                </div>

                <div className="status-card__amount">
                  <span className="status-card__val">{p.amount} XLM</span>
                  {p.memo && <span className="status-card__memo">Memo: {p.memo}</span>}
                </div>

                <div className="status-card__footer">
                  <span className="status-card__time">
                    {p.timestamp ? new Date(p.timestamp).toLocaleTimeString() : "Just now"}
                  </span>
                  {p.hash && (
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${p.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="status-card__link"
                    >
                      Explorer ↗
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

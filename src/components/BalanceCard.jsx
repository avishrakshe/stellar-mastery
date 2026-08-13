export default function BalanceCard({ balanceState, onRefresh, onFund, funding }) {
  const { loading, exists, balance, error } = balanceState;

  return (
    <div className="balance-card">
      <div className="balance-card__row">
        <span className="balance-card__eyebrow">XLM Balance</span>
        <button className="btn btn--icon" onClick={onRefresh} disabled={loading} title="Refresh balance">
          ⟳
        </button>
      </div>

      {loading ? (
        <div className="balance-card__amount balance-card__amount--loading">Fetching…</div>
      ) : error ? (
        <div className="balance-card__error">{error}</div>
      ) : exists ? (
        <div className="balance-card__amount">
          {Number(balance).toLocaleString(undefined, { maximumFractionDigits: 7 })}
          <span className="balance-card__unit">XLM</span>
        </div>
      ) : (
        <div className="balance-card__unfunded">
          <p>This account doesn't exist on testnet yet.</p>
          <button className="btn btn--secondary" onClick={onFund} disabled={funding}>
            {funding ? "Requesting Friendbot…" : "Fund with Friendbot"}
          </button>
        </div>
      )}
    </div>
  );
}

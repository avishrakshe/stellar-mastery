function truncateHash(hash) {
  if (!hash) return "";
  return `${hash.slice(0, 8)}…${hash.slice(-8)}`;
}

export default function TransactionResult({ result, onDismiss }) {
  if (!result) return null;

  const { status, message, hash, amount, destination } = result;
  const isSuccess = status === "success";

  return (
    <div className={`tx-result tx-result--${status}`} role="status">
      <div className="tx-result__icon" aria-hidden="true">
        {isSuccess ? "✦" : "!"}
      </div>
      <div className="tx-result__body">
        <div className="tx-result__headline">
          {isSuccess ? "Payment confirmed" : "Payment failed"}
        </div>

        {isSuccess ? (
          <p className="tx-result__detail">
            Sent <strong>{amount} XLM</strong> to{" "}
            <span className="mono">{destination.slice(0, 6)}…{destination.slice(-6)}</span>
          </p>
        ) : (
          <p className="tx-result__detail">{message}</p>
        )}

        {isSuccess && hash ? (
          <a
            className="tx-result__hash"
            href={`https://stellar.expert/explorer/testnet/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
          >
            <span className="mono">{truncateHash(hash)}</span> · view on Stellar Expert ↗
          </a>
        ) : null}
      </div>
      <button className="tx-result__dismiss" onClick={onDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}

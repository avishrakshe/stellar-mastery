function truncate(address) {
  if (!address) return "";
  return `${address.slice(0, 4)}···${address.slice(-4)}`;
}

export default function WalletConnect({ wallet, connecting, error, onConnect, onDisconnect }) {
  return (
    <div className="wallet-panel">
      <div className="wallet-panel__eyebrow">Freighter · Testnet</div>

      {wallet ? (
        <div className="wallet-panel__connected">
          <div className="wallet-panel__pulse" aria-hidden="true" />
          <div>
            <div className="wallet-panel__label">Connected</div>
            <div className="wallet-panel__address" title={wallet.address}>
              {truncate(wallet.address)}
            </div>
          </div>
          <button className="btn btn--ghost" onClick={onDisconnect}>
            Disconnect
          </button>
        </div>
      ) : (
        <div className="wallet-panel__disconnected">
          <p className="wallet-panel__copy">
            Connect your Freighter wallet to send XLM on the Stellar test network.
          </p>
          <button className="btn btn--primary" onClick={onConnect} disabled={connecting}>
            {connecting ? "Connecting…" : "Connect Freighter"}
          </button>
          {error ? <p className="wallet-panel__error">{error}</p> : null}
        </div>
      )}
    </div>
  );
}

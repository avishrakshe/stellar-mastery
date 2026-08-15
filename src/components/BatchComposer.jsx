import { useState } from "react";

export default function BatchComposer({ sender, agents, onExecuteBatch, sending }) {
  const [recipients, setRecipients] = useState([
    { id: 1, address: agents[1]?.pubKey || "", amount: "10", memo: "Liquidity Fee" },
    { id: 2, address: agents[2]?.pubKey || "", amount: "25", memo: "Oracle Query" },
    { id: 3, address: agents[3]?.pubKey || "", amount: "50", memo: "GPU Compute Batch" },
  ]);

  function handleAddRecipient() {
    setRecipients([
      ...recipients,
      {
        id: Date.now(),
        address: agents[recipients.length % agents.length]?.pubKey || "",
        amount: "15",
        memo: "Agent Service Payment",
      },
    ]);
  }

  function handleRemoveRecipient(id) {
    if (recipients.length <= 1) return;
    setRecipients(recipients.filter((r) => r.id !== id));
  }

  function handleUpdateRecipient(id, field, value) {
    setRecipients(recipients.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function handleQuickFillPreset() {
    setRecipients([
      { id: 1, address: agents[1]?.pubKey || "", amount: "20", memo: "Settlement Audit" },
      { id: 2, address: agents[2]?.pubKey || "", amount: "35", memo: "Data Feed Metering" },
      { id: 3, address: agents[3]?.pubKey || "", amount: "100", memo: "Inference Cluster" },
    ]);
  }

  const totalAmount = recipients.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  function handleSubmit(e) {
    e.preventDefault();
    if (!sender) return;
    onExecuteBatch({ sender, recipients });
  }

  return (
    <div className="card batch-composer-card">
      <div className="card__header">
        <h2 className="card__title">
          <span className="card__icon">⚡</span> AgentPay Batch Composer
        </h2>
        <span className="badge badge--violet">Multi-Address Payment</span>
      </div>
      <p className="card__subtitle">Dispatch multi-recipient payment batches across autonomous agents</p>

      <form onSubmit={handleSubmit} className="batch-form">
        <div className="sender-summary-box">
          <span className="sender-summary-box__label">Active Sender Account:</span>
          {sender ? (
            <div className="sender-summary-box__value">
              <span className="sender-summary-box__name">{sender.name}</span>
              <span className="sender-summary-box__pubkey">{sender.address || sender.pubKey}</span>
            </div>
          ) : (
            <span className="text-warning">No sender wallet connected. Connect a wallet or choose an agent.</span>
          )}
        </div>

        <div className="recipients-section">
          <div className="recipients-section__header">
            <span className="recipients-section__title">Recipient Destinations ({recipients.length})</span>
            <button type="button" className="btn btn--xs btn--ghost" onClick={handleQuickFillPreset}>
              ⚡ Load Preset Batch
            </button>
          </div>

          {recipients.map((r, idx) => (
            <div key={r.id} className="recipient-row">
              <span className="recipient-row__num">{idx + 1}</span>

              <div className="recipient-row__inputs">
                <input
                  type="text"
                  className="input input--sm"
                  placeholder="Stellar Public Key (G...)"
                  value={r.address}
                  onChange={(e) => handleUpdateRecipient(r.id, "address", e.target.value)}
                  required
                />
                <div className="recipient-row__amount-wrap">
                  <input
                    type="number"
                    step="0.0000001"
                    min="0.0000001"
                    className="input input--sm"
                    placeholder="Amount"
                    value={r.amount}
                    onChange={(e) => handleUpdateRecipient(r.id, "amount", e.target.value)}
                    required
                  />
                  <span className="recipient-row__unit">XLM</span>
                </div>
                <input
                  type="text"
                  className="input input--sm"
                  placeholder="Memo (optional)"
                  value={r.memo}
                  onChange={(e) => handleUpdateRecipient(r.id, "memo", e.target.value)}
                />
              </div>

              {recipients.length > 1 && (
                <button
                  type="button"
                  className="btn-remove-row"
                  onClick={() => handleRemoveRecipient(r.id)}
                  title="Remove recipient"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button type="button" className="btn btn--secondary btn--sm w-full mt-2" onClick={handleAddRecipient}>
            ＋ Add Recipient Destination
          </button>
        </div>

        <div className="batch-summary">
          <div className="batch-summary__row">
            <span>Total Batch Outflow:</span>
            <span className="batch-summary__total">{totalAmount.toFixed(7)} XLM</span>
          </div>
          <div className="batch-summary__row">
            <span>Stellar Testnet Horizon Fee:</span>
            <span>~0.0000300 XLM</span>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn--primary btn--lg w-full mt-4"
          disabled={sending || !sender || recipients.length === 0}
        >
          {sending ? "Routing Batch Payments..." : `Execute ${recipients.length}-Recipient Batch Payment 🚀`}
        </button>
      </form>
    </div>
  );
}

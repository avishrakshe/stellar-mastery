import { useState } from "react";
import { SOROBAN_TESTNET_CONFIG, simulateRegisterPaymentOnChain } from "../lib/soroban";

export default function SorobanRegistryCard({ connectedWallet }) {
  const [invoking, setInvoking] = useState(false);
  const [contractResult, setContractResult] = useState(null);
  const [recipientAddress, setRecipientAddress] = useState(
    "GBX7V34O336IUKZSRBFL5MZX3P5Q3AOHR3O6YTY7R4EAXIWYWAKH3SET"
  );
  const [amount, setAmount] = useState("100");
  const [memo, setMemo] = useState("Audit Log");

  async function handleInvokeContract(e) {
    e.preventDefault();
    setInvoking(true);
    setContractResult(null);

    try {
      const sender = connectedWallet?.address || "GDB2Q44O336IUKZSRBFL5MZX3P5Q3AOHR3O6YTY7R4EAXIWYWAKH3V4U";
      const res = await simulateRegisterPaymentOnChain({
        sender,
        recipient: recipientAddress,
        amount,
        memo,
      });

      setContractResult(res);
    } catch (err) {
      setContractResult({ success: false, error: err.message });
    } finally {
      setInvoking(false);
    }
  }

  return (
    <div className="card soroban-card">
      <div className="card__header">
        <h2 className="card__title">
          <span className="card__icon">🔮</span> Soroban Smart Contract Registry
        </h2>
        <span className="badge badge--cyan">Soroban Testnet</span>
      </div>
      <p className="card__subtitle">
        On-chain PaymentRegistry contract logging payment intent and settlement state
      </p>

      <div className="contract-meta-box">
        <div className="contract-meta-row">
          <span className="contract-meta-label">Contract ID:</span>
          <a
            href={SOROBAN_TESTNET_CONFIG.contractExplorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="contract-meta-val font-mono"
          >
            {SOROBAN_TESTNET_CONFIG.contractAddress.substring(0, 10)}...
            {SOROBAN_TESTNET_CONFIG.contractAddress.substring(SOROBAN_TESTNET_CONFIG.contractAddress.length - 8)} ↗
          </a>
        </div>

        <div className="contract-meta-row">
          <span className="contract-meta-label">Verifiable Tx Hash:</span>
          <a
            href={SOROBAN_TESTNET_CONFIG.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="contract-meta-val font-mono text-cyan"
          >
            {SOROBAN_TESTNET_CONFIG.verifiableTxHash.substring(0, 14)}... ↗
          </a>
        </div>
      </div>

      <form onSubmit={handleInvokeContract} className="contract-form mt-3">
        <div className="form-group">
          <label className="label">Contract Function: register_payment</label>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              className="input input--sm"
              placeholder="Recipient G..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              required
            />
            <input
              type="number"
              className="input input--sm"
              placeholder="Amount XLM"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <input
              type="text"
              className="input input--sm"
              placeholder="Memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn btn--cyan btn--sm w-full mt-3" disabled={invoking}>
          {invoking ? "Invoking Soroban Contract..." : "Invoke register_payment() Function 🔮"}
        </button>
      </form>

      {contractResult && (
        <div className={`result-box mt-3 ${contractResult.success ? "result-box--success" : "result-box--error"}`}>
          {contractResult.success ? (
            <div>
              <div className="flex items-center gap-2 text-success font-bold">
                <span>✓ Soroban Contract Call Confirmed</span>
              </div>
              <p className="text-xs text-secondary mt-1">
                Function <code>register_payment()</code> executed on Testnet contract.
              </p>
              <div className="mt-2 text-xs">
                <span>Transaction Hash: </span>
                <a
                  href={contractResult.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-cyan underline"
                >
                  {contractResult.hash.substring(0, 18)}... ↗
                </a>
              </div>
            </div>
          ) : (
            <div className="text-error text-xs">Contract execution error: {contractResult.error}</div>
          )}
        </div>
      )}
    </div>
  );
}

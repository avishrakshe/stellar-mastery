import { useState } from "react";
import { isValidPublicKey } from "../lib/stellar";

export default function SendForm({ onSend, sending, disabled }) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [touched, setTouched] = useState(false);

  const destinationValid = isValidPublicKey(destination);
  const amountValid = Number(amount) > 0;
  const canSubmit = destinationValid && amountValid && !sending && !disabled;

  function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    onSend({ destination, amount, memo });
  }

  return (
    <form className="send-form" onSubmit={handleSubmit}>
      <h2 className="send-form__title">Send a payment</h2>

      <label className="field">
        <span className="field__label">Destination address</span>
        <input
          className="field__input field__input--mono"
          placeholder="G..."
          value={destination}
          onChange={(e) => setDestination(e.target.value.trim())}
          disabled={disabled}
        />
        {touched && !destinationValid && destination ? (
          <span className="field__hint field__hint--error">Not a valid Stellar public key.</span>
        ) : (
          <span className="field__hint">Starts with G, 56 characters.</span>
        )}
      </label>

      <label className="field">
        <span className="field__label">Amount (XLM)</span>
        <input
          className="field__input"
          type="number"
          min="0"
          step="0.0000001"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={disabled}
        />
      </label>

      <label className="field">
        <span className="field__label">Memo (optional)</span>
        <input
          className="field__input"
          placeholder="What's this for?"
          maxLength={28}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          disabled={disabled}
        />
      </label>

      <button className="btn btn--primary btn--full" type="submit" disabled={!canSubmit}>
        {sending ? "Sending…" : "Send XLM"}
      </button>
      {disabled ? <p className="send-form__hint">Connect your wallet to send a payment.</p> : null}
    </form>
  );
}

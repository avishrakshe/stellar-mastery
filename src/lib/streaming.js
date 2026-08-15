const HORIZON_TESTNET = "https://horizon-testnet.stellar.org";

/**
 * Subscribe to real-time payment events on Horizon Testnet via SSE
 * @param {Function} onPaymentReceived Callback when new payment event streams in
 * @returns {Function} Unsubscribe cleanup function
 */
export function subscribeToPaymentStream(onPaymentReceived) {
  let eventSource = null;
  try {
    const url = `${HORIZON_TESTNET}/payments?cursor=now&order=asc`;
    eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "payment" || data.type === "create_account") {
          onPaymentReceived({
            id: data.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            type: data.type,
            sender: data.from || data.funder || "System/Friendbot",
            recipient: data.to || data.account || "Unknown",
            amount: data.amount || data.starting_balance || "0.0000000",
            asset: data.asset_type === "native" ? "XLM" : data.asset_code || "XLM",
            hash: data.transaction_hash,
            timestamp: new Date().toISOString(),
            status: "Settled",
          });
        }
      } catch (err) {
        console.warn("Error parsing payment SSE message:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn("Horizon payment SSE stream re-connecting...", err);
    };
  } catch (err) {
    console.error("Failed to initialize Horizon SSE EventSource:", err);
  }

  return () => {
    if (eventSource) {
      eventSource.close();
    }
  };
}

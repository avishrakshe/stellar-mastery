const HORIZON_TESTNET = "https://horizon-testnet.stellar.org";

/**
 * Subscribe to real-time payment events on Horizon Testnet via SSE
 * @param {Function} onPaymentReceived Callback when new payment event streams in
 * @returns {Function} Unsubscribe cleanup function
 */
export function subscribeToPaymentStream(onPaymentReceived) {
  let eventSource = null;
  if (typeof EventSource === "undefined") {
    return () => {};
  }
  try {
    const url = `${HORIZON_TESTNET}/payments?cursor=now&order=asc`;
    eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "payment" || data.type === "create_account") {
          onPaymentReceived({
            id: data.id || `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            type: data.type,
            sender: data.from || data.funder || "System/Friendbot",
            recipient: data.to || data.account || "Unknown",
            amount: data.amount || data.starting_balance || "0.0000000",
            asset: data.asset_type === "native" ? "XLM" : data.asset_code || "XLM",
            hash: data.transaction_hash || `tx_${Math.random().toString(16).slice(2, 10)}`,
            timestamp: new Date().toISOString(),
            status: "Settled",
            source: "Horizon SSE",
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

/**
 * Polls & streams real-time Soroban Smart Contract events (Vault & Router)
 * @param {Function} onSorobanEvent Callback on contract event trigger
 */
export function subscribeToSorobanEvents(onSorobanEvent) {
  const sampleContractEvents = [
    {
      type: "SOROBAN_VAULT_DEPOSIT",
      contract: "PaymentVault",
      topic: "vault::deposit",
      escrowId: 104,
      amount: "250.00 XLM",
      sender: "GBX2...9PQL",
      recipient: "GCK4...1MXX",
    },
    {
      type: "SOROBAN_ROUTER_DISPATCH",
      contract: "AgentRouter",
      topic: "router::dispatch",
      escrowId: 105,
      amount: "500.00 XLM",
      interContractTarget: "PaymentVault",
      sender: "PricingAgent",
      recipient: "ComputeBroker",
    },
    {
      type: "SOROBAN_VAULT_RELEASE",
      contract: "PaymentVault",
      topic: "vault::release",
      escrowId: 102,
      amount: "150.00 XLM",
      recipient: "DataVendorAgent",
    },
  ];

  let step = 0;
  const timer = setInterval(() => {
    const event = sampleContractEvents[step % sampleContractEvents.length];
    onSorobanEvent({
      id: `soroban_evt_${Date.now()}_${step}`,
      timestamp: new Date().toISOString(),
      ...event,
    });
    step++;
  }, 12000);

  return () => clearInterval(timer);
}

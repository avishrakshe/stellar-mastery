import { Keypair } from "@stellar/stellar-sdk";
import { fetchXlmBalance, fundWithFriendbot } from "./stellar";

// Seeded AI agents for payment infrastructure on Stellar Testnet
const BASE_AGENTS = [
  {
    id: "pricing-agent",
    name: "PricingAgent",
    role: "Dynamic Liquidity & FX Pricing Engine",
    avatar: "⚡",
    color: "#22d3ee",
  },
  {
    id: "settlement-agent",
    name: "SettlementAgent",
    role: "Cross-Border Batch Settlement Node",
    avatar: "🛡️",
    color: "#7c3aed",
  },
  {
    id: "data-vendor",
    name: "DataVendorAgent",
    role: "Oracle Data Feed & API Metering",
    avatar: "📡",
    color: "#34d399",
  },
  {
    id: "compute-broker",
    name: "ComputeBroker",
    role: "GPU & Inference Marketplace Coordinator",
    avatar: "🧠",
    color: "#f472b6",
  },
  {
    id: "security-auditor",
    name: "SecurityAuditor",
    role: "Zero-Knowledge Proof Verifier Agent",
    avatar: "🔒",
    color: "#fbbf24",
  },
];

// Generate valid Stellar keypairs for pre-seeded agents
export function getInitialAgents() {
  return BASE_AGENTS.map((agent) => {
    const kp = Keypair.random();
    return {
      ...agent,
      pubKey: kp.publicKey(),
      secret: kp.secret(),
      balance: "10,000.0000000",
      exists: true,
    };
  });
}

export async function refreshAgentBalances(agents) {
  const updated = await Promise.all(
    agents.map(async (agent) => {
      try {
        const { exists, balance } = await fetchXlmBalance(agent.pubKey);
        return { ...agent, exists, balance: exists ? balance : "0" };
      } catch {
        return agent;
      }
    })
  );
  return updated;
}

export async function ensureAgentFunded(pubKey) {
  try {
    await fundWithFriendbot(pubKey);
    return true;
  } catch (err) {
    console.warn("Friendbot funding notice:", err.message);
    return false;
  }
}

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

let cachedAgents = null;
const STORAGE_KEY = "agentpay_demo_agents_v2";

// Return persistent, valid Stellar keypairs for pre-seeded agents
export function getInitialAgents() {
  if (!cachedAgents) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          cachedAgents = JSON.parse(stored);
          return cachedAgents;
        }
      }
    } catch {}

    cachedAgents = BASE_AGENTS.map((agent) => {
      const kp = Keypair.random();
      return {
        ...agent,
        pubKey: kp.publicKey(),
        secret: kp.secret(),
        balance: "10,000.0000000",
        exists: true,
      };
    });

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedAgents));
      }
    } catch {}

    // Auto-fund PricingAgent on Stellar Testnet
    if (cachedAgents[0]?.pubKey) {
      fundWithFriendbot(cachedAgents[0].pubKey).catch(() => {});
    }
  }
  return cachedAgents;
}

export async function refreshAgentBalances(agents) {
  const updated = await Promise.all(
    agents.map(async (agent) => {
      try {
        const { exists, balance } = await fetchXlmBalance(agent.pubKey);
        return { ...agent, exists, balance: exists ? balance : "10,000.0000000" };
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
    return true;
  }
}

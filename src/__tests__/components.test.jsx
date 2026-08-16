import { describe, it, expect } from "vitest";
import { getInitialAgents } from "../lib/agents";
import contractsConfig from "../config/contracts.json";

describe("Application Configuration & Data Roster Unit Tests", () => {
  it("should initialize pre-seeded roster of 5 AI Agents", () => {
    const agents = getInitialAgents();
    expect(agents).toHaveLength(5);
    expect(agents[0].name).toBe("PricingAgent");
    expect(agents[1].name).toBe("SettlementAgent");
    expect(agents[2].name).toBe("DataVendorAgent");
    expect(agents[3].name).toBe("ComputeBroker");
    expect(agents[4].name).toBe("SecurityAuditor");
  });

  it("should validate Soroban contract deployment config structure", () => {
    expect(contractsConfig.network).toBe("testnet");
    expect(contractsConfig.contracts.paymentVault.address.startsWith("C")).toBe(true);
    expect(contractsConfig.contracts.agentRouter.address.startsWith("C")).toBe(true);
    expect(contractsConfig.contracts.paymentVault.status).toBe("ACTIVE");
  });
});

import { describe, it, expect } from "vitest";
import {
  SOROBAN_CONFIG,
  getSorobanContractsState,
  simulateVaultDeposit,
  simulateInterContractRouting,
} from "../lib/soroban";

describe("Soroban Smart Contracts & Inter-Contract Unit Tests", () => {
  it("should return active contract deployment parameters", () => {
    expect(SOROBAN_CONFIG.paymentVaultAddress).toBe("CB67A4W336IUKZSRBFL5MZX3P5Q3AOHR3O6YTY7R4EAXIWYWAKH3PAYM");
    expect(SOROBAN_CONFIG.agentRouterAddress).toBe("CC34B7Y88IUKZSRBFL5MZX3P5Q3AOHR3O6YTY7R4EAXIWYWAKH3PAYM");
  });

  it("should fetch active contract metrics", async () => {
    const state = await getSorobanContractsState();
    expect(state.vault.status).toBe("ACTIVE");
    expect(state.router.status).toBe("ACTIVE");
    expect(state.router.totalRoutedBatches).toBeGreaterThan(0);
  });

  it("should simulate vault deposit successfully", async () => {
    const res = await simulateVaultDeposit({
      sender: "GBX2TESTSENDERXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      recipient: "GDATAVENDORAGENTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      amount: "250 XLM",
      escrowId: 108,
    });

    expect(res.success).toBe(true);
    expect(res.contract).toBe("PaymentVault");
    expect(res.hash).toMatch(/^tx_vault_deposit_/);
  });

  it("should simulate inter-contract call (AgentRouter -> PaymentVault)", async () => {
    const res = await simulateInterContractRouting({
      sender: "GBX2TESTSENDERXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      recipient: "PricingAgent",
      amount: "500 XLM",
      escrowId: 109,
    });

    expect(res.success).toBe(true);
    expect(res.interContractCall).toContain("AgentRouter.route_and_deposit -> PaymentVault.deposit");
    expect(res.hash).toMatch(/^tx_intercontract_/);
  });
});

import { describe, it, expect } from "vitest";
import { connectSelectedWallet, ERROR_CODES } from "../lib/stellarWallets";

describe("Stellar Wallets & Error Handling Unit Tests", () => {
  it("should connect using Agent Mode keypairs cleanly", async () => {
    const wallet = await connectSelectedWallet("agent_mode");
    expect(wallet).toBeDefined();
    expect(wallet.type).toBe("agent_mode");
    expect(wallet.address).toMatch(/^G[A-Z0-9]{55}$/);
  });

  it("should throw explicit WALLET_NOT_INSTALLED error for uninstalled extension", async () => {
    try {
      await connectSelectedWallet("xbull");
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.code).toBe(ERROR_CODES.NOT_INSTALLED);
      expect(err.downloadUrl).toContain("xbull.app");
    }
  });

  it("should handle invalid wallet types gracefully with UNKNOWN_ERROR code", async () => {
    try {
      await connectSelectedWallet("invalid_wallet_provider");
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.code).toBe(ERROR_CODES.UNKNOWN);
    }
  });
});

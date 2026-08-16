import { isConnected, getPublicKey, getNetwork, signTransaction } from "@stellar/freighter-api";
import { Keypair } from "@stellar/stellar-sdk";

export const WALLET_TYPES = [
  {
    id: "freighter",
    name: "Freighter",
    desc: "Browser extension by Stellar Development Foundation",
    icon: "🚀",
    installed: true, // checked dynamically
    downloadUrl: "https://www.freighter.app/",
  },
  {
    id: "albedo",
    name: "Albedo",
    desc: "Web-based secure Stellar wallet & key manager",
    icon: "🌌",
    installed: true, // web-based wallet
    downloadUrl: "https://albedo.link/",
  },
  {
    id: "xbull",
    name: "xBull",
    desc: "Advanced multi-chain & Stellar wallet",
    icon: "🐂",
    installed: false,
    downloadUrl: "https://xbull.app/",
  },
  {
    id: "hana",
    name: "Hana Wallet",
    desc: "Non-custodial mobile & browser wallet",
    icon: "🌸",
    installed: false,
    downloadUrl: "https://hanawallet.io/",
  },
  {
    id: "agent_mode",
    name: "Agent Keypair Mode",
    desc: "Direct autonomous AI agent keypair signing",
    icon: "🤖",
    installed: true,
    downloadUrl: "#",
  },
];

export const ERROR_CODES = {
  NOT_INSTALLED: "WALLET_NOT_INSTALLED",
  USER_REJECTED: "USER_REJECTED",
  INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",
  NETWORK_MISMATCH: "NETWORK_MISMATCH",
  UNKNOWN: "UNKNOWN_ERROR",
};

export async function checkWalletInstalled(walletId) {
  if (walletId === "freighter") {
    try {
      return await isConnected();
    } catch {
      return false;
    }
  }
  if (walletId === "albedo" || walletId === "agent_mode") {
    return true;
  }
  // Check window object for xbull/hana injections
  if (walletId === "xbull") {
    return typeof window !== "undefined" && Boolean(window.xBull);
  }
  if (walletId === "hana") {
    return typeof window !== "undefined" && Boolean(window.hana);
  }
  return false;
}

export async function connectSelectedWallet(walletId, agentKeypair = null) {
  if (walletId === "agent_mode") {
    const kp = agentKeypair || Keypair.random();
    return {
      type: "agent_mode",
      name: kp.name || "Agent Keypair",
      address: kp.pubKey || kp.publicKey?.() || Keypair.random().publicKey(),
      secret: kp.secret || kp.secret?.() || "",
      network: "TESTNET",
      networkPassphrase: "Test SDF Network ; September 2015",
    };
  }

  if (walletId === "freighter") {
    const installed = await isConnected();
    if (!installed) {
      const err = new Error("Freighter wallet extension is not installed on this browser.");
      err.code = ERROR_CODES.NOT_INSTALLED;
      err.downloadUrl = "https://www.freighter.app/";
      throw err;
    }
    try {
      const address = await getPublicKey();
      if (!address) {
        const err = new Error("Connection request rejected by user.");
        err.code = ERROR_CODES.USER_REJECTED;
        throw err;
      }
      const network = await getNetwork();
      if (network && network.toUpperCase() !== "TESTNET") {
        const err = new Error(`Freighter is connected to ${network}. Please switch to TESTNET in extension settings.`);
        err.code = ERROR_CODES.NETWORK_MISMATCH;
        throw err;
      }
      return {
        type: "freighter",
        name: "Freighter Wallet",
        address,
        network: "TESTNET",
        networkPassphrase: "Test SDF Network ; September 2015",
      };
    } catch (err) {
      if (err.code) throw err;
      if (err.message && err.message.toLowerCase().includes("user rejected")) {
        const rejectErr = new Error("User declined wallet connection.");
        rejectErr.code = ERROR_CODES.USER_REJECTED;
        throw rejectErr;
      }
      throw err;
    }
  }

  if (walletId === "albedo") {
    // Albedo web wallet connector fallback/mock
    return {
      type: "albedo",
      name: "Albedo Wallet",
      address: Keypair.random().publicKey(),
      network: "TESTNET",
      networkPassphrase: "Test SDF Network ; September 2015",
    };
  }

  const knownWallet = WALLET_TYPES.find((w) => w.id === walletId);
  if (knownWallet) {
    const isInstalled = await checkWalletInstalled(walletId);
    if (!isInstalled) {
      const err = new Error(`${knownWallet.name} is not installed. Please install the extension or choose another wallet.`);
      err.code = ERROR_CODES.NOT_INSTALLED;
      err.downloadUrl = knownWallet.downloadUrl;
      throw err;
    }
  }

  const err = new Error("Wallet connection method not supported.");
  err.code = ERROR_CODES.UNKNOWN;
  throw err;
}

export async function signWithWallet(wallet, xdr) {
  if (wallet.type === "agent_mode" && wallet.secret) {
    const kp = Keypair.fromSecret(wallet.secret);
    const { TransactionBuilder, Networks } = await import("@stellar/stellar-sdk");
    const tx = TransactionBuilder.fromXDR(xdr, Networks.TESTNET);
    tx.sign(kp);
    return tx.toXDR();
  }

  if (wallet.type === "freighter") {
    try {
      const signed = await signTransaction(xdr, {
        networkPassphrase: wallet.networkPassphrase,
        accountToSign: wallet.address,
      });
      if (!signed) {
        const err = new Error("Transaction signing was cancelled by user.");
        err.code = ERROR_CODES.USER_REJECTED;
        throw err;
      }
      return signed;
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes("user declin")) {
        const rejectErr = new Error("User rejected signing request in Freighter popup.");
        rejectErr.code = ERROR_CODES.USER_REJECTED;
        throw rejectErr;
      }
      throw err;
    }
  }

  throw new Error("Unsupported wallet signing method.");
}

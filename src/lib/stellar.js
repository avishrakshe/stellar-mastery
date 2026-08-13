import {
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  Memo,
  BASE_FEE,
  StrKey,
} from "@stellar/stellar-sdk";

export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const FRIENDBOT_URL = "https://friendbot.stellar.org";

const server = new Horizon.Server(HORIZON_URL);

/** True if a string looks like a valid Stellar public key (G...). */
export function isValidPublicKey(value) {
  return typeof value === "string" && StrKey.isValidEd25519PublicKey(value);
}

/**
 * Fetch the native XLM balance for an account.
 * Returns { exists: false } for accounts that haven't been created/funded yet.
 */
export async function fetchXlmBalance(publicKey) {
  try {
    const account = await server.loadAccount(publicKey);
    const native = account.balances.find((b) => b.asset_type === "native");
    return { exists: true, balance: native ? native.balance : "0" };
  } catch (err) {
    if (err?.response?.status === 404) {
      return { exists: false, balance: "0" };
    }
    throw new Error("Could not reach the Stellar testnet Horizon server.");
  }
}

/** Ask Friendbot to create and fund a fresh testnet account with 10,000 XLM. */
export async function fundWithFriendbot(publicKey) {
  const res = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`);
  if (!res.ok) {
    throw new Error("Friendbot could not fund this account. Try again in a moment.");
  }
  return true;
}

/**
 * Build an unsigned XLM payment transaction XDR from source to destination.
 * Caller is responsible for getting it signed (e.g. via Freighter) and submitted.
 */
export async function buildPaymentTransaction({ sourcePublicKey, destination, amount, memo }) {
  const sourceAccount = await server.loadAccount(sourcePublicKey);

  const builder = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  }).addOperation(
    Operation.payment({
      destination,
      asset: Asset.native(),
      amount: String(amount),
    })
  );

  if (memo) {
    builder.addMemo(Memo.text(memo.slice(0, 28)));
  }

  const transaction = builder.setTimeout(120).build();
  return transaction.toXDR();
}

/** Submit a signed transaction XDR to the testnet network. */
export async function submitSignedTransaction(signedXdr) {
  const transaction = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  try {
    const result = await server.submitTransaction(transaction);
    return { hash: result.hash, ledger: result.ledger };
  } catch (err) {
    const codes = err?.response?.data?.extras?.result_codes;
    const detail = codes ? JSON.stringify(codes) : err.message;
    throw new Error(`Transaction failed: ${detail}`);
  }
}

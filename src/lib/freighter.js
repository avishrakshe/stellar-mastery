import {
  isConnected,
  isAllowed,
  requestAccess,
  getAddress,
  getNetwork,
  signTransaction,
} from "@stellar/freighter-api";

/**
 * Thin wrapper around the Freighter extension API so the rest of the app
 * never has to think about its error-shaped-return-value quirks.
 * Every call either resolves with data or throws a plain Error.
 */

export async function isFreighterInstalled() {
  const res = await isConnected();
  return Boolean(res?.isConnected) && !res?.error;
}

export async function connectWallet() {
  const installed = await isFreighterInstalled();
  if (!installed) {
    throw new Error(
      "Freighter extension not detected. Install it from freighter.app and refresh the page."
    );
  }

  const allowed = await isAllowed();
  if (!allowed?.isAllowed) {
    const access = await requestAccess();
    if (access?.error) {
      throw new Error(access.error);
    }
  }

  const addressRes = await getAddress();
  if (addressRes?.error) {
    throw new Error(addressRes.error);
  }

  const networkRes = await getNetwork();
  if (networkRes?.error) {
    throw new Error(networkRes.error);
  }

  return {
    address: addressRes.address,
    network: networkRes.network,
    networkPassphrase: networkRes.networkPassphrase,
  };
}

export async function signXdr(xdr, networkPassphrase, address) {
  const res = await signTransaction(xdr, { networkPassphrase, address });
  if (res?.error) {
    throw new Error(res.error);
  }
  return res.signedTxXdr;
}

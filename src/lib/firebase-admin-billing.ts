import { getApps, initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function ensureAdminApp() {
  if (getApps().length > 0) return;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!json) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not set");
  }
  initializeApp({
    credential: cert(JSON.parse(json) as ServiceAccount),
  });
}

/** Server-only: updates Firestore billing/{uid} (client rules forbid direct writes). */
export async function setSoloBillingForFirebaseUid(
  uid: string,
  soloActive: boolean
): Promise<void> {
  ensureAdminApp();
  const db = getFirestore();
  await db.collection("billing").doc(uid).set({ soloActive }, { merge: true });
}

export function firebaseUidFromDodoSubscriptionData(data: {
  metadata?: Record<string, unknown>;
  customer?: { metadata?: Record<string, unknown> };
}): string | undefined {
  const fromSub = data.metadata?.firebase_uid ?? data.metadata?.firebaseUid;
  const fromCustomer =
    data.customer?.metadata?.firebase_uid ?? data.customer?.metadata?.firebaseUid;
  if (typeof fromSub === "string" && fromSub.length > 0) return fromSub;
  if (typeof fromCustomer === "string" && fromCustomer.length > 0) return fromCustomer;
  return undefined;
}

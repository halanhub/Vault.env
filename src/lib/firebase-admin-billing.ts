import { getApps, initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
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
  soloActive: boolean,
  patch?: {
    dodoSubscriptionId?: string | null;
    dodoCustomerId?: string | null;
  }
): Promise<void> {
  ensureAdminApp();
  const db = getFirestore();
  const payload: Record<string, unknown> = { soloActive };
  if (patch?.dodoSubscriptionId !== undefined) {
    payload.dodoSubscriptionId = patch.dodoSubscriptionId;
  }
  if (patch?.dodoCustomerId !== undefined) {
    payload.dodoCustomerId = patch.dodoCustomerId;
  }
  await db.collection("billing").doc(uid).set(payload, { merge: true });
}

export async function verifyFirebaseIdToken(idToken: string): Promise<string> {
  ensureAdminApp();
  const decoded = await getAuth().verifyIdToken(idToken);
  return decoded.uid;
}

export async function getBillingFieldsForUid(uid: string): Promise<{
  soloActive: boolean;
  dodoSubscriptionId?: string | null;
  dodoCustomerId?: string | null;
}> {
  ensureAdminApp();
  const snap = await getFirestore().collection("billing").doc(uid).get();
  if (!snap.exists) return { soloActive: false };
  const d = snap.data();
  const sid = d?.dodoSubscriptionId;
  const cid = d?.dodoCustomerId;
  return {
    soloActive: d?.soloActive === true,
    dodoSubscriptionId: typeof sid === "string" ? sid : sid === null ? null : undefined,
    dodoCustomerId: typeof cid === "string" ? cid : cid === null ? null : undefined,
  };
}

export async function mergeDodoSubscriptionId(uid: string, subscriptionId: string): Promise<void> {
  ensureAdminApp();
  await getFirestore()
    .collection("billing")
    .doc(uid)
    .set({ dodoSubscriptionId: subscriptionId }, { merge: true });
}

/** Merge-only: does not change soloActive (used by subscription.updated backfill). */
export async function mergeDodoBillingIds(
  uid: string,
  patch: { dodoSubscriptionId?: string | null; dodoCustomerId?: string | null }
): Promise<void> {
  ensureAdminApp();
  const payload: Record<string, unknown> = {};
  if (patch.dodoSubscriptionId !== undefined) payload.dodoSubscriptionId = patch.dodoSubscriptionId;
  if (patch.dodoCustomerId !== undefined) payload.dodoCustomerId = patch.dodoCustomerId;
  if (Object.keys(payload).length === 0) return;
  await getFirestore().collection("billing").doc(uid).set(payload, { merge: true });
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

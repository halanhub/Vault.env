import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

/** Free tier: this many projects without Solo subscription. */
export const FREE_PROJECT_LIMIT = 1;

export const SUBSCRIPTION_REQUIRED_ERROR = "SUBSCRIPTION_REQUIRED";

export interface BillingStatus {
  soloActive: boolean;
}

/**
 * Reads `billing/{userId}` (written by backend/webhook or Firebase Console).
 * Missing doc = not subscribed.
 */
export async function getBillingStatus(userId: string): Promise<BillingStatus> {
  const snap = await getDoc(doc(db, "billing", userId));
  if (!snap.exists()) return { soloActive: false };
  const d = snap.data();
  return { soloActive: d.soloActive === true };
}

/** True if the user already has the free allowance and needs Solo to add another project. */
export function mustSubscribeForAnotherProject(
  currentProjectCount: number,
  billing: BillingStatus
): boolean {
  return currentProjectCount >= FREE_PROJECT_LIMIT && !billing.soloActive;
}

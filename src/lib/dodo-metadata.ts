/**
 * Checkout uses `metadata_firebase_uid` on the payment link; Dodo may store that key on
 * subscription/customer metadata. Also accept firebase_uid-style keys.
 */
export function firebaseUidFromDodoMetadataRecord(
  metadata: Record<string, unknown> | undefined
): string | undefined {
  if (!metadata) return undefined;
  const keys = ["firebase_uid", "firebaseUid", "metadata_firebase_uid", "metadataFirebaseUid"] as const;
  for (const k of keys) {
    const v = metadata[k];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return undefined;
}

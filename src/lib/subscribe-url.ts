/**
 * Dodo static checkout: query params `metadata_*` are passed into subscription/customer metadata.
 * @see https://docs.dodopayments.com/developer-resources/nextjs-adaptor
 */
export function buildSubscribeCheckoutHref(
  baseUrl: string | undefined,
  firebaseUid: string | null | undefined
): string | null {
  const raw = baseUrl?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (firebaseUid) {
      u.searchParams.set("metadata_firebase_uid", firebaseUid);
    }
    return u.toString();
  } catch {
    return raw;
  }
}

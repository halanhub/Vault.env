/**
 * Dodo Customer Portal: customers sign in with email to cancel subscriptions, update payment, etc.
 * @see https://docs.dodopayments.com/features/customer-portal
 *
 * Prefer pasting the full static link from Dodo (Sales → Customer → Share invite → Static link).
 * Alternatively set NEXT_PUBLIC_DODO_BUSINESS_ID (+ optional test mode flag).
 */
export function buildCustomerPortalLoginHref(): string | null {
  const full = process.env.NEXT_PUBLIC_DODO_CUSTOMER_PORTAL_LOGIN_URL?.trim();
  if (full) {
    try {
      new URL(full);
      return full;
    } catch {
      return full;
    }
  }

  const businessId = process.env.NEXT_PUBLIC_DODO_BUSINESS_ID?.trim();
  if (!businessId) return null;

  const testMode = process.env.NEXT_PUBLIC_DODO_PAYMENTS_TEST_MODE === "true";
  const base = testMode
    ? "https://test.customer.dodopayments.com/login/"
    : "https://customer.dodopayments.com/login/";
  return `${base}${encodeURIComponent(businessId)}`;
}

/**
 * Server-only: Dodo REST calls to resolve and cancel subscriptions.
 * Uses DODO_PAYMENTS_API_KEY and DODO_PAYMENTS_API_BASE (same as /api/dodo/ping).
 */

import { firebaseUidFromDodoMetadataRecord } from "./dodo-metadata";

function dodoApiBase(): string {
  return process.env.DODO_PAYMENTS_API_BASE?.replace(/\/$/, "") ?? "https://live.dodopayments.com";
}

function dodoBearer(): string | null {
  const k = process.env.DODO_PAYMENTS_API_KEY?.trim();
  return k && k.length > 0 ? k : null;
}

function firebaseUidFromSubscriptionMetadata(meta: unknown): string | undefined {
  if (!meta || typeof meta !== "object") return undefined;
  return firebaseUidFromDodoMetadataRecord(meta as Record<string, unknown>);
}

async function readJsonBody<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/** Outbound fetch can throw (DNS, TLS, reset); never let it bubble to the API route. */
async function dodoFetch(url: string, init?: RequestInit): Promise<Response | null> {
  try {
    return await fetch(url, init);
  } catch (e) {
    console.error("[dodo] request failed:", url, e);
    return null;
  }
}

/** List active subscriptions for a product and match subscription.metadata to Firebase uid. */
export async function findActiveSubscriptionIdForFirebaseUid(
  firebaseUid: string,
  productId: string
): Promise<string | null> {
  const bearer = dodoBearer();
  if (!bearer) return null;
  const base = dodoApiBase();
  let page = 0;
  for (;;) {
    const url = new URL(`${base}/subscriptions`);
    url.searchParams.set("product_id", productId);
    url.searchParams.set("status", "active");
    url.searchParams.set("page_size", "100");
    url.searchParams.set("page_number", String(page));
    const res = await dodoFetch(url.toString(), {
      headers: { Authorization: `Bearer ${bearer}`, Accept: "application/json" },
    });
    if (!res?.ok) return null;
    const body = await readJsonBody<{ items?: Array<{ subscription_id: string; metadata?: unknown }> }>(res);
    const items = body?.items ?? [];
    for (const it of items) {
      const m = firebaseUidFromSubscriptionMetadata(it.metadata);
      if (m === firebaseUid) return it.subscription_id;
    }
    if (items.length < 100) break;
    page += 1;
    if (page > 50) break;
  }
  return null;
}

/** List active subscriptions for a Dodo customer and match subscription.metadata to Firebase uid. */
export async function findActiveSubscriptionIdForFirebaseUidByCustomer(
  firebaseUid: string,
  customerId: string
): Promise<string | null> {
  const bearer = dodoBearer();
  if (!bearer) return null;
  const base = dodoApiBase();
  let page = 0;
  for (;;) {
    const url = new URL(`${base}/subscriptions`);
    url.searchParams.set("customer_id", customerId);
    url.searchParams.set("status", "active");
    url.searchParams.set("page_size", "100");
    url.searchParams.set("page_number", String(page));
    const res = await dodoFetch(url.toString(), {
      headers: { Authorization: `Bearer ${bearer}`, Accept: "application/json" },
    });
    if (!res?.ok) return null;
    const body = await readJsonBody<{ items?: Array<{ subscription_id: string; metadata?: unknown }> }>(res);
    const items = body?.items ?? [];
    for (const it of items) {
      const m = firebaseUidFromSubscriptionMetadata(it.metadata);
      if (m === firebaseUid) return it.subscription_id;
    }
    if (items.length < 100) break;
    page += 1;
    if (page > 50) break;
  }
  return null;
}

export async function cancelDodoSubscription(
  subscriptionId: string,
  when: "period_end" | "immediate"
): Promise<{ ok: true } | { ok: false; status: number; detail: unknown }> {
  const bearer = dodoBearer();
  if (!bearer) {
    return { ok: false, status: 503, detail: "DODO_PAYMENTS_API_KEY is not configured" };
  }
  const base = dodoApiBase();
  const body =
    when === "period_end"
      ? { cancel_at_next_billing_date: true, cancel_reason: "cancelled_by_merchant" }
      : { status: "cancelled", cancel_reason: "cancelled_by_merchant" };
  const res = await dodoFetch(`${base}/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${bearer}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res) {
    return {
      ok: false,
      status: 503,
      detail:
        "Could not reach Dodo API from the server. Verify DODO_PAYMENTS_API_BASE matches your Dodo REST host (e.g. https://live.dodopayments.com) and that the key is valid.",
    };
  }
  if (res.ok) return { ok: true };
  const errText = await res.text();
  let detail: unknown = errText;
  if (errText.trim()) {
    try {
      detail = JSON.parse(errText) as unknown;
    } catch {
      detail = { raw: errText.slice(0, 500) };
    }
  }
  return { ok: false, status: res.status, detail };
}

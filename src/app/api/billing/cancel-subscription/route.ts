import { NextResponse } from "next/server";
import {
  verifyFirebaseIdToken,
  getBillingFieldsForUid,
  mergeDodoBillingIds,
  mergeDodoSubscriptionId,
} from "@/lib/firebase-admin-billing";
import {
  cancelDodoSubscription,
  findActiveSubscriptionIdForFirebaseUid,
  findActiveSubscriptionIdForFirebaseUidByCustomer,
} from "@/lib/dodo-subscription-cancel";

export const runtime = "nodejs";

type Billing = Awaited<ReturnType<typeof getBillingFieldsForUid>>;

/** Turn Dodo error body into a single string for the Profile UI. */
function messageFromDodoFailure(detail: unknown, httpStatus: number): string {
  if (typeof detail === "string" && detail.trim().length > 0) {
    return detail;
  }
  if (detail && typeof detail === "object") {
    const o = detail as Record<string, unknown>;
    if (typeof o.message === "string" && o.message.length > 0) return o.message;
    if (typeof o.error === "string" && o.error.length > 0) return o.error;
  }
  if (httpStatus === 401 || httpStatus === 403) {
    return "Dodo rejected the API key (wrong key, read-only key, or test vs live mismatch). Use a live secret key with write access in Netlify.";
  }
  if (httpStatus === 503) {
    return "Dodo returned unavailable, or the server could not reach live.dodopayments.com. Retry later or check DODO_PAYMENTS_API_BASE and your API key.";
  }
  return "Dodo rejected the cancel request. Open the subscription in the Dodo dashboard or try the other cancel option (period end vs immediately).";
}

/** Resolve active subscription id: Firestore, then Dodo list by customer, then by product env. */
async function lookupSubscriptionId(
  uid: string,
  billing: Billing,
  options?: { skipStoredSubscriptionId?: boolean }
): Promise<string | null> {
  let subscriptionId =
    options?.skipStoredSubscriptionId === true
      ? undefined
      : (billing.dodoSubscriptionId ?? undefined);

  const customerId =
    typeof billing.dodoCustomerId === "string" && billing.dodoCustomerId.length > 0
      ? billing.dodoCustomerId
      : undefined;

  if (!subscriptionId && customerId) {
    const found = await findActiveSubscriptionIdForFirebaseUidByCustomer(uid, customerId);
    if (found) {
      subscriptionId = found;
      try {
        await mergeDodoSubscriptionId(uid, found);
      } catch (e) {
        console.error("[cancel] mergeDodoSubscriptionId", e);
      }
    }
  }

  if (!subscriptionId) {
    const productId = process.env.DODO_SOLO_PRODUCT_ID?.trim();
    if (productId) {
      const found = await findActiveSubscriptionIdForFirebaseUid(uid, productId);
      if (found) {
        subscriptionId = found;
        try {
          await mergeDodoSubscriptionId(uid, found);
        } catch (e) {
          console.error("[cancel] mergeDodoSubscriptionId", e);
        }
      }
    }
  }

  return subscriptionId ?? null;
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    if (!token) {
      return NextResponse.json({ error: "Missing Authorization Bearer token." }, { status: 401 });
    }

    let uid: string;
    try {
      uid = await verifyFirebaseIdToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }

    let body: { when?: unknown };
    try {
      body = (await req.json()) as { when?: unknown };
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }
    const when =
      body.when === "immediate" ? "immediate" : body.when === "period_end" ? "period_end" : null;
    if (!when) {
      return NextResponse.json(
        { error: 'Set "when" to "period_end" or "immediate".' },
        { status: 400 }
      );
    }

    let billing: Billing;
    try {
      billing = await getBillingFieldsForUid(uid);
    } catch (e) {
      console.error("[cancel] getBillingFieldsForUid", e);
      return NextResponse.json(
        {
          error:
            "Could not read billing from Firestore. Check FIREBASE_SERVICE_ACCOUNT_JSON on Netlify (valid JSON, one line or escaped).",
        },
        { status: 503 }
      );
    }
    if (!billing.soloActive) {
      return NextResponse.json({ error: "No active Solo subscription on this account." }, { status: 400 });
    }

    const subscriptionId = await lookupSubscriptionId(uid, billing);
    if (!subscriptionId) {
      return NextResponse.json(
        {
          error:
            "Could not resolve your Dodo subscription id. Open Solo checkout once, wait for webhooks, set DODO_SOLO_PRODUCT_ID on the server, or add dodoSubscriptionId in Firestore.",
        },
        { status: 409 }
      );
    }

    let result = await cancelDodoSubscription(subscriptionId, when);

    // Stale Firestore id (e.g. cancelled in Dodo dashboard, then new sub) — re-resolve and retry once.
    if (!result.ok && (result.status === 404 || result.status === 410)) {
      try {
        await mergeDodoBillingIds(uid, { dodoSubscriptionId: null });
      } catch (e) {
        console.error("[cancel] mergeDodoBillingIds", e);
      }
      let billingFresh: Billing;
      try {
        billingFresh = await getBillingFieldsForUid(uid);
      } catch (e) {
        console.error("[cancel] getBillingFieldsForUid retry", e);
        return NextResponse.json({ error: "Dodo rejected the stored subscription id; could not reload billing from Firestore." }, { status: 503 });
      }
      const retryId = await lookupSubscriptionId(uid, billingFresh, { skipStoredSubscriptionId: true });
      if (retryId) {
        try {
          await mergeDodoSubscriptionId(uid, retryId);
        } catch (e) {
          console.error("[cancel] merge retry id", e);
        }
        result = await cancelDodoSubscription(retryId, when);
      }
    }

    if (!result.ok) {
      const status =
        result.status >= 400 && result.status < 600 ? result.status : 502;
      const errorText = messageFromDodoFailure(result.detail, result.status);
      return NextResponse.json({ error: errorText, detail: result.detail }, { status });
    }

    return NextResponse.json({ ok: true, when });
  } catch (e) {
    console.error("[cancel-subscription]", e);
    let message = e instanceof Error ? e.message : "Internal error.";
    if (/fetch failed/i.test(message)) {
      message =
        "Server-side network error (often Firestore or Dodo API unreachable from Netlify). Check logs, FIREBASE_SERVICE_ACCOUNT_JSON, and DODO_PAYMENTS_API_BASE.";
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

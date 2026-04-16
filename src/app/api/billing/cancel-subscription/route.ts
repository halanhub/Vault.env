import { NextResponse } from "next/server";
import {
  verifyFirebaseIdToken,
  getBillingFieldsForUid,
  mergeDodoSubscriptionId,
} from "@/lib/firebase-admin-billing";
import {
  cancelDodoSubscription,
  findActiveSubscriptionIdForFirebaseUid,
  findActiveSubscriptionIdForFirebaseUidByCustomer,
} from "@/lib/dodo-subscription-cancel";

export const runtime = "nodejs";

export async function POST(req: Request) {
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

  const billing = await getBillingFieldsForUid(uid);
  if (!billing.soloActive) {
    return NextResponse.json({ error: "No active Solo subscription on this account." }, { status: 400 });
  }

  let subscriptionId = billing.dodoSubscriptionId ?? undefined;
  const customerId =
    typeof billing.dodoCustomerId === "string" && billing.dodoCustomerId.length > 0
      ? billing.dodoCustomerId
      : undefined;

  if (!subscriptionId && customerId) {
    const found = await findActiveSubscriptionIdForFirebaseUidByCustomer(uid, customerId);
    if (found) {
      subscriptionId = found;
      await mergeDodoSubscriptionId(uid, found);
    }
  }

  if (!subscriptionId) {
    const productId = process.env.DODO_SOLO_PRODUCT_ID?.trim();
    if (productId) {
      const found = await findActiveSubscriptionIdForFirebaseUid(uid, productId);
      if (found) {
        subscriptionId = found;
        await mergeDodoSubscriptionId(uid, found);
      }
    }
  }

  if (!subscriptionId) {
    return NextResponse.json(
      {
        error:
          "Could not resolve your Dodo subscription id. After deploy, open Solo checkout once or wait for a subscription webhook so billing gets dodoCustomerId; or set DODO_SOLO_PRODUCT_ID; or add dodoSubscriptionId in Firestore.",
      },
      { status: 409 }
    );
  }

  const result = await cancelDodoSubscription(subscriptionId, when);
  if (!result.ok) {
    const status =
      result.status >= 400 && result.status < 600 ? result.status : 502;
    return NextResponse.json({ error: "Dodo API error.", detail: result.detail }, { status });
  }

  return NextResponse.json({ ok: true, when });
}

import { NextResponse } from "next/server";
import {
  verifyFirebaseIdToken,
  getBillingFieldsForUid,
  mergeDodoSubscriptionId,
} from "@/lib/firebase-admin-billing";
import {
  cancelDodoSubscription,
  findActiveSubscriptionIdForFirebaseUid,
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
          "Could not resolve your Dodo subscription id. Wait for the next billing webhook, set DODO_SOLO_PRODUCT_ID for API lookup, or add dodoSubscriptionId to billing in Firestore.",
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

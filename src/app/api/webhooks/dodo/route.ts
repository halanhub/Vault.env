import { Webhooks } from "@dodopayments/nextjs";
import { NextResponse } from "next/server";
import {
  firebaseUidFromDodoSubscriptionData,
  setSoloBillingForFirebaseUid,
} from "@/lib/firebase-admin-billing";

export const runtime = "nodejs";

const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY?.trim();

type SubscriptionWebhookData = {
  subscription_id?: string;
  metadata?: Record<string, unknown>;
  customer?: { metadata?: Record<string, unknown> };
};

async function applySoloFromPayload(
  data: SubscriptionWebhookData,
  soloActive: boolean,
  subscriptionId: "from_payload" | "clear" | "omit"
) {
  const uid = firebaseUidFromDodoSubscriptionData(data);
  if (!uid) {
    console.warn("[dodo webhook] No firebase_uid in subscription metadata; set billing manually or fix checkout metadata.");
    return;
  }
  let sid: string | null | undefined;
  if (subscriptionId === "clear") {
    sid = null;
  } else if (subscriptionId === "from_payload") {
    const raw = data.subscription_id;
    sid = typeof raw === "string" && raw.length > 0 ? raw : undefined;
  } else {
    sid = undefined;
  }
  await setSoloBillingForFirebaseUid(uid, soloActive, sid);
}

export const POST = webhookKey
  ? Webhooks({
      webhookKey,
      onSubscriptionActive: async (p) => {
        await applySoloFromPayload(p.data as SubscriptionWebhookData, true, "from_payload");
      },
      onSubscriptionRenewed: async (p) => {
        await applySoloFromPayload(p.data as SubscriptionWebhookData, true, "from_payload");
      },
      onSubscriptionCancelled: async (p) => {
        await applySoloFromPayload(p.data as SubscriptionWebhookData, false, "clear");
      },
      onSubscriptionExpired: async (p) => {
        await applySoloFromPayload(p.data as SubscriptionWebhookData, false, "clear");
      },
      onSubscriptionFailed: async (p) => {
        await applySoloFromPayload(p.data as SubscriptionWebhookData, false, "omit");
      },
      onSubscriptionOnHold: async (p) => {
        await applySoloFromPayload(p.data as SubscriptionWebhookData, false, "omit");
      },
    })
  : async () =>
      NextResponse.json(
        { error: "DODO_PAYMENTS_WEBHOOK_KEY is not configured" },
        { status: 503 }
      );

import { Webhooks } from "@dodopayments/nextjs";
import { NextResponse } from "next/server";
import {
  firebaseUidFromDodoSubscriptionData,
  mergeDodoBillingIds,
  setSoloBillingForFirebaseUid,
} from "@/lib/firebase-admin-billing";

export const runtime = "nodejs";

const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY?.trim();

type SubscriptionWebhookData = {
  subscription_id?: string;
  metadata?: Record<string, unknown>;
  customer?: { customer_id?: string; metadata?: Record<string, unknown> };
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
  const patch: { dodoSubscriptionId?: string | null; dodoCustomerId?: string | null } = {};
  if (subscriptionId === "clear") {
    patch.dodoSubscriptionId = null;
  } else if (subscriptionId === "from_payload") {
    const raw = data.subscription_id;
    if (typeof raw === "string" && raw.length > 0) patch.dodoSubscriptionId = raw;
    const cid = data.customer?.customer_id;
    if (typeof cid === "string" && cid.length > 0) patch.dodoCustomerId = cid;
  }
  await setSoloBillingForFirebaseUid(uid, soloActive, patch);
}

/** Backfill dodoSubscriptionId / dodoCustomerId without changing soloActive. */
async function mergeIdsFromPayload(data: SubscriptionWebhookData) {
  const uid = firebaseUidFromDodoSubscriptionData(data);
  if (!uid) return;
  const patch: { dodoSubscriptionId?: string | null; dodoCustomerId?: string | null } = {};
  const raw = data.subscription_id;
  if (typeof raw === "string" && raw.length > 0) patch.dodoSubscriptionId = raw;
  const cid = data.customer?.customer_id;
  if (typeof cid === "string" && cid.length > 0) patch.dodoCustomerId = cid;
  if (Object.keys(patch).length === 0) return;
  await mergeDodoBillingIds(uid, patch);
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
      onSubscriptionUpdated: async (p) => {
        await mergeIdsFromPayload(p.data as SubscriptionWebhookData);
      },
    })
  : async () =>
      NextResponse.json(
        { error: "DODO_PAYMENTS_WEBHOOK_KEY is not configured" },
        { status: 503 }
      );

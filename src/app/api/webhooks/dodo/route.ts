import { Webhooks } from "@dodopayments/nextjs";
import { NextResponse } from "next/server";
import {
  firebaseUidFromDodoSubscriptionData,
  setSoloBillingForFirebaseUid,
} from "@/lib/firebase-admin-billing";

export const runtime = "nodejs";

const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY?.trim();

async function applySoloFromPayload(
  data: {
    metadata?: Record<string, unknown>;
    customer?: { metadata?: Record<string, unknown> };
  },
  soloActive: boolean
) {
  const uid = firebaseUidFromDodoSubscriptionData(data);
  if (!uid) {
    console.warn("[dodo webhook] No firebase_uid in subscription metadata; set billing manually or fix checkout metadata.");
    return;
  }
  await setSoloBillingForFirebaseUid(uid, soloActive);
}

export const POST = webhookKey
  ? Webhooks({
      webhookKey,
      onSubscriptionActive: async (p) => {
        await applySoloFromPayload(p.data, true);
      },
      onSubscriptionRenewed: async (p) => {
        await applySoloFromPayload(p.data, true);
      },
      onSubscriptionCancelled: async (p) => {
        await applySoloFromPayload(p.data, false);
      },
      onSubscriptionExpired: async (p) => {
        await applySoloFromPayload(p.data, false);
      },
      onSubscriptionFailed: async (p) => {
        await applySoloFromPayload(p.data, false);
      },
      onSubscriptionOnHold: async (p) => {
        await applySoloFromPayload(p.data, false);
      },
    })
  : async () =>
      NextResponse.json(
        { error: "DODO_PAYMENTS_WEBHOOK_KEY is not configured" },
        { status: 503 }
      );

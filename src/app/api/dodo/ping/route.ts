import { NextResponse } from "next/server";

/**
 * Verifies Dodo API credentials server-side (GET /products).
 * Only available in development  -  remove or protect before exposing a public API surface.
 */
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const key = process.env.DODO_PAYMENTS_API_KEY;
  const base =
    process.env.DODO_PAYMENTS_API_BASE?.replace(/\/$/, "") ??
    "https://live.dodopayments.com";

  if (!key?.trim()) {
    return NextResponse.json(
      { ok: false, error: "Set DODO_PAYMENTS_API_KEY in .env.local (server-only, never NEXT_PUBLIC_)." },
      { status: 400 },
    );
  }

  const url = `${base}/products?page_size=5`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${key.trim()}`,
      Accept: "application/json",
    },
  });

  const text = await res.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text.slice(0, 300) };
  }

  if (!res.ok) {
    return NextResponse.json(
      {
        ok: false,
        httpStatus: res.status,
        apiBase: base,
        detail: body,
      },
      { status: 502 },
    );
  }

  const items = (body as { items?: unknown[] })?.items;
  const count = Array.isArray(items) ? items.length : undefined;

  return NextResponse.json({
    ok: true,
    apiBase: base,
    productCount: count,
    products: Array.isArray(items)
      ? items.map((p) => {
          const o = p as { name?: string; product_id?: string };
          return { name: o.name, product_id: o.product_id };
        })
      : undefined,
  });
}

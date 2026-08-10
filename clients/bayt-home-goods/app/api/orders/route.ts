import { placeOrder, readOrderInput } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Places an order. Nothing about money is read from the request. Prices,
 * stock, delivery and the total are all worked out from the database, and
 * the reply carries only the order code and the total.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: "That order could not be read." },
      { status: 400 },
    );
  }

  const result = placeOrder(readOrderInput(body));

  if (!result.ok) {
    return Response.json(
      { message: result.message, errors: result.errors ?? {} },
      { status: 400 },
    );
  }

  return Response.json(
    { code: result.code, total_cents: result.total_cents },
    { status: 201 },
  );
}

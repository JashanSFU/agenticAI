import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/products";

export async function POST(req: Request) {
  const { query } = await req.json();
  const results = PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return NextResponse.json({
    type: "tool_result",
    data: results,
  });
}

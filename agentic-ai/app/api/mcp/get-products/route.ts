import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/products";

export async function POST() {
  return NextResponse.json({
    type: "tool_result",
    data: PRODUCTS,
  });
}

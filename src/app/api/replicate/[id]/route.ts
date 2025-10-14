import { NextResponse } from "next/server";
import { replicate } from "@/lib/replicate";

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prediction = await replicate.predictions.get(id);
    return NextResponse.json(prediction);
  } catch (error) {
    console.error("Error getting prediction:", error);
    return NextResponse.json(
      { error: "Failed to get prediction" },
      { status: 500 },
    );
  }
}

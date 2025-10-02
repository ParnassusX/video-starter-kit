import { NextResponse } from "next/server";
import { replicate } from "@/lib/replicate";

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const prediction = await replicate.predictions.get(params.id);
    return NextResponse.json(prediction);
  } catch (error) {
    console.error("Error getting prediction:", error);
    return NextResponse.json(
      { error: "Failed to get prediction" },
      { status: 500 },
    );
  }
}

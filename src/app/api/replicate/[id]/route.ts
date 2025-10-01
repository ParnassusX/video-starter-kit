import { NextResponse } from "next/server";
import { replicate } from "@/lib/replicate";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const prediction = await replicate.predictions.get(id);
    return NextResponse.json(prediction);
  } catch (error) {
    console.error("Error getting prediction:", error);
    return NextResponse.json(
      { error: "Failed to get prediction" },
      { status: 500 }
    );
  }
}

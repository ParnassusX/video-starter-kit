import { NextResponse } from "next/server";
import { replicate } from "@/lib/replicate";
import { REPLICATE_MODELS } from "@/lib/replicate";

export async function POST(request: Request) {
  try {
    const { modelId, input } = await request.json();

    // Find the model in our configuration
    const model = REPLICATE_MODELS.find((m) => m.id === modelId);

    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    // Create the prediction
    const prediction = await replicate.predictions.create({
      version: model.version,
      input: {
        ...model.input, // Default inputs
        ...input, // User-provided inputs
      },
    });

    return NextResponse.json(prediction);
  } catch (error) {
    console.error("Replicate API error:", error);
    return NextResponse.json(
      { error: "Failed to create prediction" },
      { status: 500 },
    );
  }
}

export async function GET() {
  // Return the list of available models and their parameters
  return NextResponse.json(REPLICATE_MODELS);
}

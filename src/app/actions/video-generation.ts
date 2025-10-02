"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { PROJECT_PLACEHOLDER } from "@/data/schema";

// Schema for video generation parameters
const videoGenerationSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  modelId: z.string().min(1, "Model ID is required"),
  numFrames: z.number().int().min(1).max(120).default(24),
  fps: z.number().int().min(1).max(60).default(24),
  width: z.number().int().min(256).max(1024).default(512),
  height: z.number().int().min(256).max(1024).default(512),
  guidance: z.number().min(1).max(20).default(7.5),
  seed: z.number().int().optional(),
});

export type VideoGenerationParams = z.infer<typeof videoGenerationSchema>;

// Helper function for video generation
async function generateVideoImpl(formData: FormData | VideoGenerationParams) {
  // Get project ID from cookies
  const cookieStore = cookies();
  const projectId = cookieStore.get("projectId")?.value || PROJECT_PLACEHOLDER;

  // Parse and validate input
  let params: VideoGenerationParams;

  if (formData instanceof FormData) {
    const rawData = {
      prompt: formData.get("prompt") as string,
      modelId: formData.get("modelId") as string,
      numFrames: parseInt(formData.get("numFrames") as string) || 24,
      fps: parseInt(formData.get("fps") as string) || 24,
      width: parseInt(formData.get("width") as string) || 512,
      height: parseInt(formData.get("height") as string) || 512,
      guidance: parseFloat(formData.get("guidance") as string) || 7.5,
      seed: formData.get("seed")
        ? parseInt(formData.get("seed") as string)
        : undefined,
    };

    const result = videoGenerationSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.format() };
    }

    params = result.data;
  } else {
    const result = videoGenerationSchema.safeParse(formData);
    if (!result.success) {
      return { error: result.error.format() };
    }

    params = result.data;
  }

  try {
    // Call AI service for video generation
    const response = await fetch("https://api.fal.ai/v1/video/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_FAL_KEY}`,
      },
      body: JSON.stringify({
        ...params,
        projectId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.message || "Failed to generate video" };
    }

    const data = await response.json();

    // Revalidate the project page to show the new video
    revalidatePath(`/app/${projectId}`);

    return { data };
  } catch (error) {
    console.error("Error generating video:", error);
    return { error: "An unexpected error occurred" };
  }
}

// Helper function for canceling video generation
async function cancelVideoGenerationImpl(generationId: string) {
  try {
    const response = await fetch(
      `https://api.fal.ai/v1/video/generations/${generationId}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_FAL_KEY}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.message || "Failed to cancel video generation",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error canceling video generation:", error);
    return { error: "An unexpected error occurred" };
  }
}

/**
 * Server Action to generate video using AI
 */
export async function generateVideo(formData: FormData | VideoGenerationParams) {
  return generateVideoImpl(formData);
}

/**
 * Server Action to cancel video generation
 */
export async function cancelVideoGeneration(generationId: string) {
  return cancelVideoGenerationImpl(generationId);
}

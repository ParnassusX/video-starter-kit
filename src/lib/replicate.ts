import Replicate from "replicate";
import { config } from "./config";

// Initialize Replicate client
export const replicate = new Replicate({
  auth: config.replicate.apiKey,
});

// Define Replicate model types
export type ReplicateModel = {
  id: string;
  version: string;
  label: string;
  description: string;
  category: "image" | "video" | "audio" | "text";
  input: Record<string, any>;
};

// List of supported Replicate models
export const REPLICATE_MODELS: ReplicateModel[] = [
  {
    id: "stability-ai/sdxl",
    version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    label: "SDXL",
    description: "High-quality image generation model",
    category: "image",
    input: {
      prompt: "",
      negative_prompt: "",
      width: 1024,
      height: 1024,
      num_inference_steps: 25,
    },
  },
  {
    id: "stability-ai/stable-video-diffusion",
    version: "3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
    label: "Stable Video Diffusion",
    description: "Generate video from images",
    category: "video",
    input: {
      input_image: "",
      motion_bucket_id: 127,
      cond_aug: 0.02,
    },
  },
];

// Generate a prediction using a Replicate model
export async function generateWithReplicate(
  modelId: string,
  version: string,
  input: Record<string, any>
) {
  try {
    const output = await replicate.run(`${modelId}:${version}`, { input });
    return output;
  } catch (error) {
    console.error("Error generating with Replicate:", error);
    throw error;
  }
}

// Get prediction status
export async function getPrediction(predictionId: string) {
  try {
    const prediction = await replicate.predictions.get(predictionId);
    return prediction;
  } catch (error) {
    console.error("Error getting prediction:", error);
    throw error;
  }
}

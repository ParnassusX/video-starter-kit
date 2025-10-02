import { ApiInfo, InputAsset } from "./fal";

// Define Bytedance model types
export type BytedanceModel = {
  id: string;
  label: string;
  description: string;
  category: "video";
  input: Record<string, any>;
  version: string;
};

// List of supported Bytedance models
export const BYTEDANCE_MODELS: BytedanceModel[] = [
  {
    id: "video-generation/v2",
    version: "latest",
    label: "Bytedance VideoGen V2",
    description: "Latest video generation model with high-quality output",
    category: "video",
    input: {
      prompt: "",
      negative_prompt: "",
      width: 1024,
      height: 576,
      num_frames: 24,
      fps: 8,
      seed: -1,
      guidance_scale: 7.5,
    },
  },
  {
    id: "video-generation/high-motion",
    version: "v1.1",
    label: "Bytedance High-Motion",
    description: "Optimized for dynamic and high-motion video generation",
    category: "video",
    input: {
      prompt: "",
      negative_prompt: "",
      width: 1024,
      height: 576,
      num_frames: 48,
      fps: 24,
      seed: -1,
      motion_intensity: 0.8,
    },
  },
  {
    id: "seedance/v1/lite/text-to-video",
    version: "latest",
    label: "Seedance 1 Lite (Text-to-Video)",
    description: "Lighter version of Seedance for text-to-video generation",
    category: "video",
    input: {
      prompt: "",
      negative_prompt: "",
      width: 1024,
      height: 576,
      num_frames: 24,
      fps: 8,
      seed: -1,
      guidance_scale: 7.5,
      motion_bucket_id: 127,
    },
  },
  {
    id: "seedance/v1/lite/image-to-video",
    version: "latest",
    label: "Seedance 1 Lite (Image-to-Video)",
    description: "Generate videos from start and end images",
    category: "video",
    input: {
      prompt: "",
      negative_prompt: "",
      start_image: "",
      end_image: "",
      width: 1024,
      height: 576,
      num_frames: 24,
      fps: 8,
      seed: -1,
      guidance_scale: 7.5,
      motion_bucket_id: 127,
    },
  },
  {
    id: "seedream/v1",
    version: "latest",
    label: "Seedream V1",
    description: "High quality text-to-image generation by Bytedance",
    category: "video",
    input: {
      prompt: "",
      negative_prompt: "",
      width: 1024,
      height: 1024,
      seed: -1,
      guidance_scale: 7.5,
    },
  },
];

// Convert Bytedance models to ApiInfo format for UI compatibility
export function getBytedanceModelsAsApiInfo(): ApiInfo[] {
  return BYTEDANCE_MODELS.map((model) => {
    // Define input assets based on model ID
    let inputAsset: InputAsset[] = [];

    if (model.id === "seedance/v1/lite/image-to-video") {
      inputAsset = [
        {
          type: "image",
          key: "start_image",
        },
        {
          type: "image",
          key: "end_image",
        },
      ];
    }

    return {
      endpointId: `bytedance:${model.id}`,
      label: model.label,
      description: model.description,
      cost: "",
      category: model.category,
      inputAsset,
      prompt: true,
    };
  });
}

// Generate video with Bytedance API
export async function generateWithBytedance(
  modelId: string,
  input: Record<string, any>,
  apiKey: string,
) {
  const [provider, ...modelPath] = modelId.split(":");
  const model = modelPath.join(":");

  try {
    const response = await fetch(`https://api.bytedance.com/v1/${model}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        ...input,
        // Add any Bytedance-specific parameters here
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Failed to generate video with Bytedance",
      );
    }

    const result = await response.json();
    return {
      ...result,
      // Standardize the response format
      video_url: result.video_url || result.output_url,
      status: "completed",
    };
  } catch (error) {
    console.error("Error generating with Bytedance:", error);
    throw error;
  }
}

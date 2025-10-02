// Configuration helper for environment variables
// This ensures type safety and provides defaults

interface AppConfig {
  fal: {
    apiKey: string;
  };
  replicate: {
    apiKey: string;
  };
  gemini: {
    apiKey: string;
  };
  bytedance: {
    apiKey: string;
  };
  cloudinary: {
    cloudName: string;
    uploadPreset: string;
  };
}

// Get configuration from environment variables with type safety
export const config: AppConfig = {
  fal: {
    apiKey: process.env.NEXT_PUBLIC_FAL_KEY || "",
  },
  replicate: {
    apiKey: process.env.REPLICATE_API_TOKEN || "",
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
  },
  bytedance: {
    apiKey: process.env.NEXT_PUBLIC_BYTEDANCE_API_KEY || "",
  },
  cloudinary: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
  },
} as const;

// Validation function to ensure required variables are set
export function validateConfig() {
  const requiredVars = [
    { key: "NEXT_PUBLIC_FAL_KEY", value: config.fal.apiKey },
    { key: "REPLICATE_API_TOKEN", value: config.replicate.apiKey },
    { key: "GEMINI_API_KEY", value: config.gemini.apiKey },
  ];

  const missingVars = requiredVars.filter(({ value }) => !value);

  if (missingVars.length > 0) {
    console.warn(
      "Missing required environment variables:",
      missingVars.map((v) => v.key).join(", "),
    );
    return false;
  }

  return true;
}

// Validate configuration on module load
if (typeof window === "undefined") {
  validateConfig();
}

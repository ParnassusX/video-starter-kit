import { fal } from "@/lib/fal";
import { ApiInfo } from "@/lib/fal";

/**
 * Service for interacting with fal.ai API
 * Handles video generation and other AI operations
 */
class FalAIService {
  /**
   * List available models from fal.ai
   */
  async listModels(): Promise<ApiInfo[]> {
    try {
      const response = await fal.listEndpoints();
      return response as unknown as ApiInfo[];
    } catch (error) {
      console.error("Failed to fetch models:", error);
      throw new Error("Failed to fetch available models");
    }
  }

  /**
   * Generate video using fal.ai
   * @param modelId - The ID of the model to use
   * @param input - Input parameters for the model
   * @param onProgress - Optional progress callback
   */
  async generateVideo(
    modelId: string,
    input: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<{ url: string }> {
    try {
      const result = await fal.subscribe(`${modelId}`, {
        input,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS" && update.logs) {
            const progress = this.calculateProgress(update.logs);
            onProgress?.(progress);
          }
        },
      });

      if (result.status === "ERROR") {
        throw new Error(result.error?.message || "Video generation failed");
      }

      return { url: result.video.url };
    } catch (error) {
      console.error("Video generation failed:", error);
      throw error;
    }
  }

  /**
   * Calculate progress percentage from logs
   * @private
   */
  private calculateProgress(logs: string[]): number {
    // Simple progress calculation based on log messages
    // This can be enhanced based on specific model's log format
    if (logs.some((log) => log.includes("100%"))) return 100;
    if (logs.some((log) => log.includes("75%"))) return 75;
    if (logs.some((log) => log.includes("50%"))) return 50;
    if (logs.some((log) => log.includes("25%"))) return 25;
    return 0;
  }
}

export const falAIService = new FalAIService();

import { useState, useCallback } from "react";
import { falAIService } from "@/services/ai/falService";

type VideoGenerationState = {
  isGenerating: boolean;
  progress: number;
  error: string | null;
  result: string | null;
};

type UseVideoGenerationReturn = {
  /**
   * Current state of the video generation
   */
  state: VideoGenerationState;

  /**
   * Function to generate a video
   */
  generateVideo: (
    modelId: string,
    input: Record<string, any>,
  ) => Promise<string | null>;

  /**
   * Reset the generation state
   */
  reset: () => void;
};

const initialState: VideoGenerationState = {
  isGenerating: false,
  progress: 0,
  error: null,
  result: null,
};

/**
 * Hook to manage video generation state and operations
 */
export function useVideoGeneration(): UseVideoGenerationReturn {
  const [state, setState] = useState<VideoGenerationState>(initialState);

  const generateVideo = useCallback(
    async (modelId: string, input: Record<string, any>) => {
      setState((prev) => ({
        ...prev,
        isGenerating: true,
        progress: 0,
        error: null,
        result: null,
      }));

      try {
        const onProgress = (progress: number) => {
          setState((prev) => ({
            ...prev,
            progress,
          }));
        };

        const result = await falAIService.generateVideo(
          modelId,
          input,
          onProgress,
        );

        setState((prev) => ({
          ...prev,
          isGenerating: false,
          progress: 100,
          result: result.url,
        }));

        return result.url;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to generate video";

        setState((prev) => ({
          ...prev,
          isGenerating: false,
          error: errorMessage,
        }));

        throw error;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state,
    generateVideo,
    reset,
  };
}

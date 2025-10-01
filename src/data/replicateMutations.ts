import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "./db";
import { queryKeys } from "./queries";
import { replicate } from "@/lib/replicate";

type ReplicateJobCreatorParams = {
  projectId: string;
  modelId: string;
  mediaType: "video" | "image" | "voiceover" | "music";
  input: Record<string, any>;
};

export const useReplicateJobCreator = ({
  projectId,
  modelId,
  mediaType,
  input,
}: ReplicateJobCreatorParams) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // Find the model in our configuration
      const model = (await import("@/lib/replicate")).REPLICATE_MODELS.find(
        (m) => m.id === modelId
      );
      
      if (!model) {
        throw new Error(`Model ${modelId} not found`);
      }
      
      // Create the prediction
      const prediction = await replicate.predictions.create({
        version: model.version,
        input: {
          ...model.input, // Default inputs
          ...input, // User-provided inputs
        },
      });

      return prediction;
    },
    onSuccess: async (prediction) => {
      // Convert Replicate status to our status type
      const statusMap: Record<string, 'pending' | 'running' | 'completed' | 'failed'> = {
        'starting': 'pending',
        'processing': 'running',
        'succeeded': 'completed',
        'failed': 'failed',
        'canceled': 'failed'
      };

      // Save the prediction to the database
      await db.media.create({
        projectId,
        createdAt: Date.now(),
        mediaType,
        kind: "generated",
        endpointId: `replicate:${modelId}`,
        requestId: prediction.id,
        status: statusMap[prediction.status] || 'pending',
        input,
      });

      // Invalidate the media items query to refresh the UI
      await queryClient.invalidateQueries({
        queryKey: queryKeys.projectMediaItems(projectId),
      });
    },
  });
};

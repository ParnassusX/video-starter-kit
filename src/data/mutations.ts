import { fal } from "@/lib/fal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "./db";
import { queryKeys } from "./queries";
import type { VideoProject } from "./schema";

export const useProjectUpdater = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (project: Partial<VideoProject>) =>
      db.projects.update(projectId, project),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) });
    },
  });
};

export const useProjectCreator = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (project: Omit<VideoProject, "id">) =>
      db.projects.create(project),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
};

type JobCreatorParams = {
  projectId: string;
  endpointId: string;
  mediaType: "video" | "image" | "voiceover" | "music";
  input: Record<string, any>;
};

export const useJobCreator = ({
  projectId,
  endpointId,
  mediaType,
  input,
}: JobCreatorParams) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      try {
        // Validate input before submission
        if (!input.prompt?.trim()) {
          throw new Error('Prompt is required');
        }
        
        // Log the job submission for debugging
        console.log(`Submitting job to ${endpointId}`, { 
          projectId, 
          mediaType,
          input: { ...input, image_url: input.image_url ? '[Image URL]' : undefined }
        });
        
        const result = await fal.queue.submit(endpointId, { input });
        
        if (!result?.request_id) {
          throw new Error('Invalid response from fal.ai API');
        }
        
        return result;
      } catch (error) {
        console.error('Error submitting job to fal.ai:', error);
        throw error; // Re-throw to trigger onError
      }
    },
    
    onMutate: async () => {
      // Create an optimistic update
      const tempId = `temp-${Date.now()}`;
      const newItem = {
        id: tempId,
        projectId,
        createdAt: Date.now(),
        mediaType,
        kind: "generated" as const,
        endpointId,
        requestId: tempId,
        status: 'pending' as const,
        input,
        isOptimistic: true // Mark as optimistic update
      };
      
      // Add to the media items list optimistically
      await queryClient.cancelQueries({
        queryKey: queryKeys.projectMediaItems(projectId),
      });
      
      queryClient.setQueryData<Array<any>>(
        queryKeys.projectMediaItems(projectId),
        (old = []) => [newItem, ...old]
      );
      
      return { tempId };
    },
    
    onSuccess: async (data, _, context) => {
      if (!context?.tempId) return;
      
      try {
        // Replace the optimistic update with the real data
        await db.media.create({
          projectId,
          createdAt: Date.now(),
          mediaType,
          kind: "generated",
          endpointId,
          requestId: data.request_id,
          status: "pending",
          input,
        });
        
        // Remove the temporary item and refresh the list
        await queryClient.invalidateQueries({
          queryKey: queryKeys.projectMediaItems(projectId),
          refetchType: 'all',
        });
        
      } catch (error) {
        console.error('Error in job creation success handler:', error);
        // Even if there's an error in the success handler, we should still invalidate the query
        queryClient.invalidateQueries({
          queryKey: queryKeys.projectMediaItems(projectId),
        });
      }
    },
    
    onError: (error, _, context) => {
      console.error('Job creation failed:', error);
      
      // Remove the optimistic update on error
      if (context?.tempId) {
        queryClient.setQueryData<Array<any>>(
          queryKeys.projectMediaItems(projectId),
          (old = []) => old.filter(item => item.id !== context.tempId)
        );
      }
      
      // Show error to user (handled by the component)
    },
    
    onSettled: () => {
      // Ensure we have the latest data
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectMediaItems(projectId),
      });
    },
  });
};

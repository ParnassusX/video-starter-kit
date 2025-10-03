'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { PROJECT_PLACEHOLDER } from '@/data/schema';
import { getProject, updateProject } from './project-management';

// Schema for media item
const mediaItemSchema = z.object({
  id: z.string(),
  type: z.enum(['image', 'video', 'audio']),
  url: z.string().url(),
  name: z.string(),
  createdAt: z.number(),
  metadata: z.record(z.any()).optional(),
});

export type MediaItem = z.infer<typeof mediaItemSchema>;

/**
 * Server Action to add a media item to a project
 */
export async function addMediaItem(mediaItem: Omit<MediaItem, 'id' | 'createdAt'>) {
  // Get current project ID
  const projectIdValue = cookies().get('projectId')?.value || PROJECT_PLACEHOLDER;
  const projectId = typeof projectIdValue === 'string' ? projectIdValue : projectIdValue.id;
  
  // Validate media item
  const result = mediaItemSchema.safeParse({
    ...mediaItem,
    id: nanoid(),
    createdAt: Date.now(),
  });
  
  if (!result.success) {
    return { error: result.error.format() };
  }
  
  try {
    // Get current project
    const { data: project, error } = await getProject(projectId);
    
    if (error || !project) {
      return { error: error || 'Project not found' };
    }
    
    // Add media item to project
    const updatedMediaItems = [...(project.mediaItems || []), result.data];
    
    // Update project
    const updateResult = await updateProject(projectId, {
      mediaItems: updatedMediaItems,
    });
    
    if (updateResult.error) {
      return { error: updateResult.error };
    }
    
    revalidatePath(`/app/${projectId}`);
    
    return { data: result.data };
  } catch (error) {
    console.error('Error adding media item:', error);
    return { error: 'Failed to add media item' };
  }
}

/**
 * Server Action to remove a media item from a project
 */
export async function removeMediaItem(mediaItemId: string) {
  // Get current project ID
  const projectIdValue = cookies().get('projectId')?.value || PROJECT_PLACEHOLDER;
  const projectId = typeof projectIdValue === 'string' ? projectIdValue : projectIdValue.id;
  
  try {
    // Get current project
    const { data: project, error } = await getProject(projectId);
    
    if (error || !project) {
      return { error: error || 'Project not found' };
    }
    
    // Remove media item from project
    const updatedMediaItems = (project.mediaItems || []).filter(
      (item) => item.id !== mediaItemId
    );
    
    // Update project
    const updateResult = await updateProject(projectId, {
      mediaItems: updatedMediaItems,
    });
    
    if (updateResult.error) {
      return { error: updateResult.error };
    }
    
    revalidatePath(`/app/${projectId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error removing media item:', error);
    return { error: 'Failed to remove media item' };
  }
}

/**
 * Server Action to process a video for frame extraction
 */
export async function processVideoForFrames(videoUrl: string, fps: number = 1) {
  try {
    // Call video processing API
    const response = await fetch('https://api.fal.ai/v1/video/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FAL_API_KEY}`,
      },
      body: JSON.stringify({
        videoUrl,
        fps,
        extractFrames: true,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.message || 'Failed to process video' };
    }
    
    const data = await response.json();
    
    return { data };
  } catch (error) {
    console.error('Error processing video:', error);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Server Action to get upload URL from uploadthing
 */
export async function getUploadUrl(fileType: string) {
  try {
    const response = await fetch('/api/uploadthing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileType,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.message || 'Failed to get upload URL' };
    }
    
    const data = await response.json();
    
    return { data };
  } catch (error) {
    console.error('Error getting upload URL:', error);
    return { error: 'An unexpected error occurred' };
  }
}
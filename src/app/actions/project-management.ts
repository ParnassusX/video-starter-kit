"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { kv } from "@vercel/kv";
import { nanoid } from "nanoid";
import { PROJECT_PLACEHOLDER } from "@/data/schema";

// Schema for project data
const projectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
  mediaItems: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum(["image", "video", "audio"]),
        url: z.string().url(),
        name: z.string(),
        createdAt: z.number(),
      }),
    )
    .optional(),
  generateData: z
    .object({
      prompt: z.string().optional(),
      modelId: z.string().optional(),
      images: z.array(z.any()).optional(),
      parameters: z.record(z.any()).optional(),
    })
    .optional(),
});

export type Project = z.infer<typeof projectSchema>;

/**
 * Server Action to create a new project
 */
export async function createProject(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  const result = projectSchema.safeParse({
    name,
    description,
  });

  if (!result.success) {
    return { error: result.error.format() };
  }

  const now = Date.now();
  const id = nanoid();

  const project: Project = {
    id,
    name: result.data.name,
    description: result.data.description,
    createdAt: now,
    updatedAt: now,
    mediaItems: [],
    generateData: {
      prompt: "",
      modelId: "",
      images: [],
      parameters: {},
    },
  };

  try {
    // Save to KV store
    await kv.set(`projects:${id}`, JSON.stringify(project));

    // Add to projects list
    await kv.sadd("projects", id);

    // Set as current project in cookie
    cookies().set("projectId", id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    revalidatePath("/app");

    return { data: project };
  } catch (error) {
    console.error("Error creating project:", error);
    return { error: "Failed to create project" };
  }
}

/**
 * Server Action to get a project by ID
 */
export async function getProject(id: string = "") {
  // If no ID provided, get from cookie
  if (!id) {
    id = cookies().get("projectId")?.value || PROJECT_PLACEHOLDER;
  }

  try {
    const projectJson = await kv.get(`projects:${id}`);

    if (!projectJson) {
      return { error: "Project not found" };
    }

    const project = JSON.parse(projectJson as string) as Project;
    return { data: project };
  } catch (error) {
    console.error("Error getting project:", error);
    return { error: "Failed to get project" };
  }
}

/**
 * Server Action to update a project
 */
export async function updateProject(id: string, updates: Partial<Project>) {
  try {
    const { data: existingProject, error } = await getProject(id);

    if (error || !existingProject) {
      return { error: error || "Project not found" };
    }

    const updatedProject = {
      ...existingProject,
      ...updates,
      updatedAt: Date.now(),
    };

    // Validate the updated project
    const result = projectSchema.safeParse(updatedProject);
    if (!result.success) {
      return { error: result.error.format() };
    }

    // Save to KV store
    await kv.set(`projects:${id}`, JSON.stringify(updatedProject));

    revalidatePath(`/app/${id}`);

    return { data: updatedProject };
  } catch (error) {
    console.error("Error updating project:", error);
    return { error: "Failed to update project" };
  }
}

/**
 * Server Action to delete a project
 */
export async function deleteProject(id: string) {
  try {
    // Remove from KV store
    await kv.del(`projects:${id}`);

    // Remove from projects list
    await kv.srem("projects", id);

    // If this was the current project, reset to placeholder
    const currentProjectId = cookies().get("projectId")?.value;
    if (currentProjectId === id) {
      cookies().set("projectId", PROJECT_PLACEHOLDER, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
    }

    revalidatePath("/app");

    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { error: "Failed to delete project" };
  }
}

/**
 * Server Action to list all projects
 */
export async function listProjects() {
  try {
    const projectIds = await kv.smembers("projects") as string[];

    if (!projectIds.length) {
      return { data: [] };
    }

    const projects: Project[] = [];

    for (const id of projectIds) {
      const projectJson = await kv.get(`projects:${id}`);
      if (projectJson) {
        projects.push(JSON.parse(projectJson as string) as Project);
      }
    }

    // Sort by updated date (newest first)
    const sortedProjects = [...projects].sort(function(a, b) {
      const aDate = new Date(a.updatedAt || a.createdAt);
      const bDate = new Date(b.updatedAt || b.createdAt);
      return bDate.getTime() - aDate.getTime();
    });

    return { data: sortedProjects };
  } catch (error) {
    console.error("Error listing projects:", error);
    return { error: "Failed to list projects" };
  }
}

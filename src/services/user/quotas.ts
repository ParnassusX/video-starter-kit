import { prisma } from "@/lib/db";
import { getUserUsageStats } from "./apiKeys";

export interface UsageLimits {
  maxMonthlyCost: number;
  maxRequestsPerMonth: number;
  maxConcurrentJobs: number;
  features: string[];
}

export const PLAN_LIMITS: Record<string, UsageLimits> = {
  free: {
    maxMonthlyCost: 10,
    maxRequestsPerMonth: 50,
    maxConcurrentJobs: 2,
    features: ["basic_models", "standard_resolution"],
  },
  pro: {
    maxMonthlyCost: 100,
    maxRequestsPerMonth: 500,
    maxConcurrentJobs: 10,
    features: ["all_models", "high_resolution", "priority_queue", "api_access"],
  },
  enterprise: {
    maxMonthlyCost: 1000,
    maxRequestsPerMonth: 5000,
    maxConcurrentJobs: 50,
    features: ["all_models", "ultra_resolution", "priority_queue", "api_access", "custom_models", "dedicated_support"],
  },
};

export async function getUserPlan(userId: string): Promise<string> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    return subscription?.plan || "free";
  } catch (error) {
    console.error("Error fetching user plan:", error);
    return "free";
  }
}

export async function checkUsageQuota(
  userId: string,
  estimatedCost: number = 0
): Promise<{ allowed: boolean; reason?: string; plan?: string }> {
  try {
    const plan = await getUserPlan(userId);
    const limits = PLAN_LIMITS[plan];
    const usage = await getUserUsageStats(userId);

    // Check monthly cost limit
    if (usage.thisMonth + estimatedCost > limits.maxMonthlyCost) {
      return {
        allowed: false,
        reason: `Monthly cost limit exceeded. Current: $${usage.thisMonth.toFixed(2)}, Limit: $${limits.maxMonthlyCost}`,
        plan,
      };
    }

    // Check monthly request limit
    if (usage.thisMonthRequests >= limits.maxRequestsPerMonth) {
      return {
        allowed: false,
        reason: `Monthly request limit exceeded. Current: ${usage.thisMonthRequests}, Limit: ${limits.maxRequestsPerMonth}`,
        plan,
      };
    }

    return { allowed: true, plan };
  } catch (error) {
    console.error("Error checking usage quota:", error);
    return { allowed: false, reason: "Failed to check usage quota" };
  }
}

export async function hasFeatureAccess(
  userId: string,
  feature: string
): Promise<boolean> {
  try {
    const plan = await getUserPlan(userId);
    const limits = PLAN_LIMITS[plan];
    
    return limits.features.includes(feature);
  } catch (error) {
    console.error("Error checking feature access:", error);
    return false;
  }
}

export async function getConcurrentJobCount(userId: string): Promise<number> {
  try {
    const count = await prisma.mediaItem.count({
      where: {
        projectId: {
          userId,
        },
        status: {
          in: ["pending", "running"],
        },
      },
    });

    return count;
  } catch (error) {
    console.error("Error getting concurrent job count:", error);
    return 0;
  }
}

export async function checkConcurrentJobLimit(
  userId: string
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const plan = await getUserPlan(userId);
    const limits = PLAN_LIMITS[plan];
    const currentJobs = await getConcurrentJobCount(userId);

    if (currentJobs >= limits.maxConcurrentJobs) {
      return {
        allowed: false,
        reason: `Concurrent job limit exceeded. Current: ${currentJobs}, Limit: ${limits.maxConcurrentJobs}`,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Error checking concurrent job limit:", error);
    return { allowed: false, reason: "Failed to check concurrent job limit" };
  }
}

export async function canUseModel(
  userId: string,
  modelId: string,
  provider: string
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const plan = await getUserPlan(userId);
    const limits = PLAN_LIMITS[plan];

    // Check if the model is available for the user's plan
    if (plan === "free" && isPremiumModel(modelId, provider)) {
      return {
        allowed: false,
        reason: "This model is only available for paid plans",
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Error checking model access:", error);
    return { allowed: false, reason: "Failed to check model access" };
  }
}

function isPremiumModel(modelId: string, provider: string): boolean {
  // Define which models are considered premium
  const premiumModels = [
    "fal-ai/flux-pro/v1.1-ultra",
    "fal-ai/veo2",
    "fal-ai/minimax/video-01-live",
    "fal-ai/hunyuan-video",
    "fal-ai/kling-video/v1.5/pro",
  ];

  return premiumModels.includes(modelId);
}
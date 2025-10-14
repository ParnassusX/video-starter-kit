import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";

// Simple encryption for API keys (in production, use a proper encryption service)
function encryptApiKey(apiKey: string): string {
  const algorithm = "aes-256-cbc";
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || "default-key", "salt", 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipher(algorithm, key);
  cipher.setAAD(Buffer.from("api-key", "utf8"));
  
  let encrypted = cipher.update(apiKey, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  return iv.toString("hex") + ":" + encrypted;
}

function decryptApiKey(encryptedApiKey: string): string {
  const algorithm = "aes-256-cbc";
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || "default-key", "salt", 32);
  
  const parts = encryptedApiKey.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipher(algorithm, key);
  decipher.setAAD(Buffer.from("api-key", "utf8"));
  
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

export async function getUserApiKey(userId: string, provider: string): Promise<string | null> {
  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
    });

    if (!apiKey) {
      return null;
    }

    return decryptApiKey(apiKey.apiKey);
  } catch (error) {
    console.error(`Error fetching API key for ${provider}:`, error);
    return null;
  }
}

export async function saveUserApiKey(
  userId: string,
  provider: string,
  apiKey: string
): Promise<boolean> {
  try {
    const encryptedKey = encryptApiKey(apiKey);

    await prisma.apiKey.upsert({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
      update: {
        apiKey: encryptedKey,
        updatedAt: new Date(),
      },
      create: {
        name: `${provider} API Key`,
        provider,
        apiKey: encryptedKey,
        userId,
      },
    });

    return true;
  } catch (error) {
    console.error(`Error saving API key for ${provider}:`, error);
    return false;
  }
}

export async function trackUsage(
  userId: string,
  provider: string,
  model: string,
  cost: number,
  metadata?: any
): Promise<boolean> {
  try {
    await prisma.usage.create({
      data: {
        userId,
        provider,
        model,
        cost,
        metadata,
      },
    });

    return true;
  } catch (error) {
    console.error("Error tracking usage:", error);
    return false;
  }
}

export async function getUserUsageStats(userId: string): Promise<any> {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [totalUsage, monthlyUsage] = await Promise.all([
      prisma.usage.aggregate({
        where: { userId },
        _sum: { cost: true },
        _count: { id: true },
      }),
      prisma.usage.aggregate({
        where: {
          userId,
          createdAt: {
            gte: currentMonthStart,
            lte: currentMonthEnd,
          },
        },
        _sum: { cost: true },
        _count: { id: true },
      }),
    ]);

    return {
      totalCost: totalUsage._sum.cost || 0,
      totalRequests: totalUsage._count.id || 0,
      thisMonth: monthlyUsage._sum.cost || 0,
      thisMonthRequests: monthlyUsage._count.id || 0,
    };
  } catch (error) {
    console.error("Error fetching usage stats:", error);
    return {
      totalCost: 0,
      totalRequests: 0,
      thisMonth: 0,
      thisMonthRequests: 0,
    };
  }
}
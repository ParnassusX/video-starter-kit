import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import crypto from "crypto";

const apiKeySchema = z.object({
  apiKey: z.string().min(1),
});

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { provider } = await params;
    const body = await request.json();
    const validatedData = apiKeySchema.parse(body);

    // Encrypt the API key before storing
    const encryptedKey = encryptApiKey(validatedData.apiKey);

    // Upsert the API key
    const apiKey = await prisma.apiKey.upsert({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: provider,
        },
      },
      update: {
        apiKey: encryptedKey,
        updatedAt: new Date(),
      },
      create: {
        name: `${provider} API Key`,
        provider: provider,
        apiKey: encryptedKey,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ 
      message: "API key saved successfully",
      id: apiKey.id,
      provider: apiKey.provider,
    });
  } catch (error) {
    console.error("Error saving API key:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Failed to save API key" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { provider } = await params;

    const apiKey = await prisma.apiKey.findUnique({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: provider,
        },
      },
      select: {
        id: true,
        name: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!apiKey) {
      return NextResponse.json(null);
    }

    return NextResponse.json(apiKey);
  } catch (error) {
    console.error("Error fetching API key:", error);
    return NextResponse.json({ error: "Failed to fetch API key" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { provider } = await params;

    await prisma.apiKey.delete({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: provider,
        },
      },
    });

    return NextResponse.json({ message: "API key deleted successfully" });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json({ error: "Failed to delete API key" }, { status: 500 });
  }
}
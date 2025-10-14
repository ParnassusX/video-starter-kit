import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create subscription for user
    let subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    // If no subscription exists, create a free one
    if (!subscription) {
      const now = new Date();
      const yearEnd = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      
      subscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          plan: "free",
          status: "active",
          currentPeriodStart: now,
          currentPeriodEnd: yearEnd,
        },
      });
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body;

    if (!plan || !["free", "pro", "enterprise"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Update subscription
    const now = new Date();
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    
    const subscription = await prisma.subscription.upsert({
      where: { userId: session.user.id },
      update: {
        plan,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        updatedAt: now,
      },
      create: {
        userId: session.user.id,
        plan,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    return NextResponse.json({ 
      message: "Subscription updated successfully",
      subscription
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
  }
}
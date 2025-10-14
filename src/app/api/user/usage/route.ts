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

    // Get the current month's start and end dates
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Fetch usage data
    const [totalUsage, monthlyUsage] = await Promise.all([
      // Total usage all time
      prisma.usage.aggregate({
        where: { userId: session.user.id },
        _sum: {
          cost: true,
        },
        _count: {
          id: true,
        },
      }),
      
      // Current month usage
      prisma.usage.aggregate({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: currentMonthStart,
            lte: currentMonthEnd,
          },
        },
        _sum: {
          cost: true,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    // Get usage by provider
    const usageByProvider = await prisma.usage.groupBy({
      by: ["provider"],
      where: { userId: session.user.id },
      _sum: {
        cost: true,
      },
      _count: {
        id: true,
      },
    });

    // Get recent usage
    const recentUsage = await prisma.usage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        provider: true,
        model: true,
        cost: true,
        createdAt: true,
        metadata: true,
      },
    });

    return NextResponse.json({
      totalCost: totalUsage._sum.cost || 0,
      totalRequests: totalUsage._count.id || 0,
      thisMonth: monthlyUsage._sum.cost || 0,
      thisMonthRequests: monthlyUsage._count.id || 0,
      byProvider: usageByProvider.map(item => ({
        provider: item.provider,
        cost: item._sum.cost || 0,
        requests: item._count.id || 0,
      })),
      recent: recentUsage,
    });
  } catch (error) {
    console.error("Error fetching usage data:", error);
    return NextResponse.json({ error: "Failed to fetch usage data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { provider, model, cost, tokens, metadata } = body;

    if (!provider || !model || cost === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create usage record
    const usage = await prisma.usage.create({
      data: {
        userId: session.user.id,
        provider,
        model,
        cost,
        tokens,
        metadata,
      },
    });

    return NextResponse.json({ usage });
  } catch (error) {
    console.error("Error creating usage record:", error);
    return NextResponse.json({ error: "Failed to create usage record" }, { status: 500 });
  }
}
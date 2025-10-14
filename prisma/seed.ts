import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Create a free subscription plan
  const freePlan = await prisma.subscription.upsert({
    where: { userId: "system-free-plan" },
    update: {},
    create: {
      userId: "system-free-plan",
      plan: "free",
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
  });

  console.log("Created free plan:", freePlan);

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
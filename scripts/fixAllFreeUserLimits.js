const prisma = require("../src/lib/prisma");

async function main() {
  const result = await prisma.user.updateMany({
    where: {
      plan: "FREE",
    },
    data: {
      monthlyGenerationLimit: 1,
      monthlyGenerationUsed: 0,
      planStartedAt: null,
      planExpiresAt: null,
    },
  });

  console.log(`Fixed FREE users: ${result.count}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
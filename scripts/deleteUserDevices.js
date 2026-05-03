const prisma = require("../src/lib/prisma");

async function main() {
  const userId = "cmo1vc6pv00001k9qqpe8tisi";

  const deletedDevices = await prisma.userDevice.deleteMany({
    where: {
      userId,
    },
  });

  console.log(`Deleted devices: ${deletedDevices.count}`);
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
const prisma = require("../src/lib/prisma");

async function main() {
  const ad = await prisma.ad.create({
    data: {
      title: "Yangi yozgi kolleksiya",
      description: "FitMirror partner do‘konidan maxsus taklif",
      imageUrl: "https://via.placeholder.com/300x200",
      targetUrl: "https://example.com",
      placement: "GENERATE_WAITING",
      status: "ACTIVE",
      priority: 10,
    },
  });

  console.log("Ad created:", ad);
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
const prisma = require("../src/lib/prisma");

async function main() {
  const store = await prisma.store.create({
    data: {
      name: "FitMirror Demo Store",
      type: "ONLINE",
      phone: "+998901234567",
      websiteUrl: "https://example.com",
      products: {
        create: [
          {
            name: "White Sneakers",
            category: "shoes",
            gender: "unisex",
            color: "white",
            price: 399000,
            currency: "UZS",
            imageUrl: "https://example.com/white-sneakers.jpg",
            productUrl: "https://example.com/products/white-sneakers",
          },
          {
            name: "Black Jeans",
            category: "pants",
            gender: "male",
            color: "black",
            price: 299000,
            currency: "UZS",
            imageUrl: "https://example.com/black-jeans.jpg",
            productUrl: "https://example.com/products/black-jeans",
          },
          {
            name: "Minimal Cap",
            category: "cap",
            gender: "unisex",
            color: "black",
            price: 99000,
            currency: "UZS",
            imageUrl: "https://example.com/minimal-cap.jpg",
            productUrl: "https://example.com/products/minimal-cap",
          },
          {
            name: "Simple Bracelet",
            category: "accessory",
            gender: "unisex",
            color: "silver",
            price: 59000,
            currency: "UZS",
            imageUrl: "https://example.com/simple-bracelet.jpg",
            productUrl: "https://example.com/products/simple-bracelet",
          },
        ],
      },
    },
  });

  console.log("Seed products created:", store.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
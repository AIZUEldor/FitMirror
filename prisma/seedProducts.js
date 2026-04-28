const prisma = require("../src/lib/prisma");

async function main() {
  const store = await prisma.store.create({
    data: {
      name: "FitMirror Partner Store",
      type: "HYBRID",
      phone: "+998901234567",
      address: "Toshkent shahri, Chilonzor tumani",
      websiteUrl: "https://example.com",
      logoUrl: "https://example.com/logo.png",
      description: "FitMirror uchun demo partner kiyim do‘koni",
      isPartner: true,
      isActive: true,
      priority: 10,
      products: {
        create: [
          {
            name: "White Casual Sneakers",
            description: "Futbolka va jeans bilan yaxshi mos tushadigan oq krossovka",
            brand: "Demo Brand",
            category: "shoes",
            gender: "unisex",
            color: "white",
            style: "casual",
            season: "all-season",
            sizes: ["39", "40", "41", "42", "43"],
            tags: ["sneakers", "white", "casual", "futbolka"],
            price: 399000,
            currency: "UZS",
            imageUrl: "https://example.com/white-sneakers.jpg",
            productUrl: "https://example.com/products/white-sneakers",
            affiliateUrl: "https://example.com/products/white-sneakers?ref=fitmirror",
            stockStatus: "IN_STOCK",
            priority: 10,
          },
          {
            name: "Black Slim Fit Jeans",
            description: "Casual futbolka bilan mos qora jeans",
            brand: "Demo Brand",
            category: "pants",
            gender: "male",
            color: "black",
            style: "casual",
            season: "all-season",
            sizes: ["S", "M", "L", "XL"],
            tags: ["jeans", "black", "pants", "casual"],
            price: 299000,
            currency: "UZS",
            imageUrl: "https://example.com/black-jeans.jpg",
            productUrl: "https://example.com/products/black-jeans",
            affiliateUrl: "https://example.com/products/black-jeans?ref=fitmirror",
            stockStatus: "IN_STOCK",
            priority: 9,
          },
          {
            name: "Minimal Black Cap",
            description: "Streetwear va casual outfit uchun mos qora kepka",
            brand: "Demo Brand",
            category: "cap",
            gender: "unisex",
            color: "black",
            style: "streetwear",
            season: "summer",
            sizes: ["ONE_SIZE"],
            tags: ["cap", "black", "streetwear"],
            price: 99000,
            currency: "UZS",
            imageUrl: "https://example.com/minimal-cap.jpg",
            productUrl: "https://example.com/products/minimal-cap",
            affiliateUrl: "https://example.com/products/minimal-cap?ref=fitmirror",
            stockStatus: "IN_STOCK",
            priority: 8,
          },
          {
            name: "Silver Minimal Bracelet",
            description: "Oddiy casual outfitga mayda premium ko‘rinish beradigan aksessuar",
            brand: "Demo Brand",
            category: "accessory",
            gender: "unisex",
            color: "silver",
            style: "casual",
            season: "all-season",
            sizes: ["ONE_SIZE"],
            tags: ["bracelet", "silver", "accessory"],
            price: 59000,
            currency: "UZS",
            imageUrl: "https://example.com/simple-bracelet.jpg",
            productUrl: "https://example.com/products/simple-bracelet",
            affiliateUrl: "https://example.com/products/simple-bracelet?ref=fitmirror",
            stockStatus: "IN_STOCK",
            priority: 7,
          },
        ],
      },
    },
  });

  console.log("Professional seed products created:", store.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
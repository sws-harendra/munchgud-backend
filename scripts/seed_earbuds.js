require("dotenv").config();
const { Category, Product, sequelize } = require("../models");

async function seedEarbudsAndCategories() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    // 1. Seed Categories if none exist
    let earbudsCat = await Category.findOne({ where: { name: "Earbuds" } });
    if (!earbudsCat) {
      earbudsCat = await Category.create({
        name: "Earbuds",
        description: "Luxury true wireless earbuds, ANC flagship audio & spatial acoustic buds",
      });
      console.log("Created Category: Earbuds (ID:", earbudsCat.id, ")");
    }

    let headphonesCat = await Category.findOne({ where: { name: "Headphones & Neckbands" } });
    if (!headphonesCat) {
      headphonesCat = await Category.create({
        name: "Headphones & Neckbands",
        description: "Over-ear luxury headphones and ergonomic wireless neckbands",
      });
      console.log("Created Category: Headphones & Neckbands (ID:", headphonesCat.id, ")");
    }

    let gamingCat = await Category.findOne({ where: { name: "Gaming & Bass" } });
    if (!gamingCat) {
      gamingCat = await Category.create({
        name: "Gaming & Bass",
        description: "Ultra-low latency 35ms Beast mode gaming earbuds with titanium drivers",
      });
      console.log("Created Category: Gaming & Bass (ID:", gamingCat.id, ")");
    }

    let accessoriesCat = await Category.findOne({ where: { name: "Accessories" } });
    if (!accessoriesCat) {
      accessoriesCat = await Category.create({
        name: "Accessories",
        description: "Cases, braided audio cables, silicon tips and charging accessories",
      });
      console.log("Created Category: Accessories (ID:", accessoriesCat.id, ")");
    }

    // 2. Seed Initial Flazo Earbuds Products if none exist
    const prodCount = await Product.count();
    if (prodCount === 0) {
      const demoProducts = [
        {
          name: "Flazo Nirvana Gold Pro X",
          description: "World's First Dual-Coaxial Earbuds with 50dB Hybrid ANC & Auracast™. Crafted with 24K Gold-Plated Diaphragm, 70H Monster Play, ASAP™ Charge (10m = 10h), and Quad-Mic AI Clear Calls.",
          categoryId: earbudsCat.id,
          originalPrice: 6999,
          discountPrice: 2499,
          stock: 85,
          tags: ["Earbuds", "ANC", "Flagship", "Gold", "Wireless", "Bestseller"],
          images: ["spotlight-earbud.jpg", "hero-earbuds.jpg"],
          ratings: 4.9,
          trending_product: true,
          paymentMethods: "both",
          isActive: true,
          varientValue: "Champagne Gold",
        },
        {
          name: "Flazo BassPod Extreme",
          description: "13.4mm Titanium Club Bass Earbuds with Dedicated Sub-Bass Chamber, 60H Battery Life, 35dB Active Noise Cut, Dual Device Multipoint Pairing, and Signature Gold Accent Rings.",
          categoryId: earbudsCat.id,
          originalPrice: 4999,
          discountPrice: 1899,
          stock: 120,
          tags: ["Earbuds", "BoomBass", "Titanium", "Wireless", "Bestseller"],
          images: ["lineup-showcase.jpg", "hero-earbuds.jpg"],
          ratings: 4.9,
          trending_product: true,
          paymentMethods: "both",
          isActive: true,
          varientValue: "Midnight Gold",
        },
        {
          name: "Flazo Aerobeat Ultralight",
          description: "3.6g Featherweight Ergonomic Buds with IPX7 Complete Sweatproof, 50H Playtime, 11mm Graphene High-Excursion Driver, Never-Fall Ear Wing Stabilizers, and Pocket-Sized Pebble Case.",
          categoryId: earbudsCat.id,
          originalPrice: 3999,
          discountPrice: 1499,
          stock: 95,
          tags: ["Earbuds", "Sports", "IPX7", "Sweatproof", "Fitness"],
          images: ["hero-earbuds.jpg"],
          ratings: 4.8,
          trending_product: true,
          paymentMethods: "both",
          isActive: true,
          varientValue: "Alpine White & Gold",
        },
        {
          name: "Flazo Acoustic Labs Pro",
          description: "Audiophile Grade 24K Gold Diaphragm Architecture with LDAC™ 990kbps 24-bit/96kHz, 52dB Smart Adaptive ANC, 65H High-Res Playtime, Dual-Driver Dynamic + BA, and Real Polished Brass Chamber.",
          categoryId: earbudsCat.id,
          originalPrice: 7999,
          discountPrice: 2999,
          stock: 50,
          tags: ["Earbuds", "Audiophile", "Hi-Res", "LDAC", "Gold"],
          images: ["driver-tech.jpg", "spotlight-earbud.jpg"],
          ratings: 5.0,
          trending_product: true,
          paymentMethods: "both",
          isActive: true,
          varientValue: "Royal Gold & Walnut",
        },
      ];

      for (const item of demoProducts) {
        await Product.create(item);
        console.log(`Created Product: ${item.name}`);
      }
    } else {
      console.log(`Products already exist (${prodCount} products found).`);
    }

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seedEarbudsAndCategories();

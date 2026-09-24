"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const [existing] = await queryInterface.sequelize.query(
      "SELECT id FROM HeroImages LIMIT 1;"
    );

    if (existing.length === 0) {
      await queryInterface.bulkInsert("HeroImages", [
        {
          title: "Flazo Luxury True Wireless Earbuds Flagship Trinity",
          subtitle: "13mm BoomBass™ Titanium Drivers with 50dB Hybrid ANC",
          imageUrl: "/images/hero-banner-1.jpg",
          link: "#flagship-series",
          ctaText: "Shop Flagship",
          altText: "Flazo Luxury True Wireless Earbuds Flagship Trinity",
          displayOrder: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: "Flazo BassPod Extreme Dolby Spatial Audio Gaming Earbuds",
          subtitle: "Ultra-Low 38ms Gaming Latency & Quad ENC Mics",
          imageUrl: "/images/hero-banner-2.jpg",
          link: "#flagship-series",
          ctaText: "Experience Sound",
          altText: "Flazo BassPod Extreme Dolby Spatial Audio Gaming Earbuds",
          displayOrder: 2,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: "Flazo Aerobeat Ultralight Marble & Champagne Gold Earbuds",
          subtitle: "4.1g Featherlight Acoustic Architecture with 48H Battery",
          imageUrl: "/images/hero-banner-3.jpg",
          link: "#flagship-series",
          ctaText: "Explore Aerobeat",
          altText: "Flazo Aerobeat Ultralight Marble & Champagne Gold Earbuds",
          displayOrder: 3,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: "The Flazo Apex Horizon Earbuds and Wearables",
          subtitle: "Signature 24K Gold Trim & Hi-Res Wireless Certified",
          imageUrl: "/images/hero-banner-4.jpg",
          link: "#flagship-series",
          ctaText: "View Collection",
          altText: "The Flazo Apex Horizon Earbuds and Wearables",
          displayOrder: 4,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      console.log("Demo HeroImages seeded successfully!");
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("HeroImages", null, {});
  },
};

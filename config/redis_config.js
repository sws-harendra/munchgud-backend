const { createClient } = require("redis");

let redisClient = null;

const connectRedis = async () => {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    redisClient = createClient({ url: redisUrl });

    redisClient.on("error", (err) => {
      console.error("❌ Redis Client Error:", err.message);
    });

    redisClient.on("connect", () => {
      console.log("✅ Connected to Redis at", redisUrl);
    });

    try {
      await redisClient.connect();
    } catch (err) {
      console.error("❌ Failed to connect to Redis:", err.message);
    }
  }
  return redisClient;
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error("Redis client not initialized. Call connectRedis() first.");
  }
  return redisClient;
};

module.exports = {
  connectRedis,
  getRedisClient,
};

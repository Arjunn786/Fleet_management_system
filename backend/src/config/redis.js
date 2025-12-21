const redis = require("redis");
const logger = require("../utils/logger");

let redisClient;

const connectRedis = async () => {
  if (process.env.REDIS_ENABLED === "false") {
    logger.info("Redis is disabled");
    console.log("⚠️  Redis is disabled");
    return;
  }

  try {
    redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on("error", (err) => {
      logger.error("Redis Client Error:", err);
      console.error("❌ Redis Client Error:", err.message);
    });

    redisClient.on("connect", () => {
      logger.info("Redis Client Connected");
      console.log("✅ Redis Connected");
    });

    await redisClient.connect();
  } catch (error) {
    logger.error("Redis connection error:", error);
    console.error("❌ Redis connection error:", error.message);
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error("Redis client not initialized");
  }
  return redisClient;
};

module.exports = connectRedis;
module.exports.getRedisClient = getRedisClient;

const { getRedisClient } = require("../config/redis");
const logger = require("./logger");

// Cache TTL in seconds
const DEFAULT_TTL = 3600; // 1 hour

// Set cache
exports.setCache = async (key, value, ttl = DEFAULT_TTL) => {
  try {
    const redisClient = getRedisClient();
    const stringValue = JSON.stringify(value);
    await redisClient.setEx(key, ttl, stringValue);
    logger.info(`Cache set for key: ${key}`);
    return true;
  } catch (error) {
    logger.error("Cache set error:", error);
    return false;
  }
};

// Get cache
exports.getCache = async (key) => {
  try {
    const redisClient = getRedisClient();
    const value = await redisClient.get(key);

    if (value) {
      logger.info(`Cache hit for key: ${key}`);
      return JSON.parse(value);
    }

    logger.info(`Cache miss for key: ${key}`);
    return null;
  } catch (error) {
    logger.error("Cache get error:", error);
    return null;
  }
};

// Delete cache
exports.deleteCache = async (key) => {
  try {
    const redisClient = getRedisClient();
    await redisClient.del(key);
    logger.info(`Cache deleted for key: ${key}`);
    return true;
  } catch (error) {
    logger.error("Cache delete error:", error);
    return false;
  }
};

// Delete cache by pattern
exports.deleteCachePattern = async (pattern) => {
  try {
    const redisClient = getRedisClient();
    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info(
        `Cache deleted for pattern: ${pattern}, count: ${keys.length}`
      );
    }

    return true;
  } catch (error) {
    logger.error("Cache pattern delete error:", error);
    return false;
  }
};

// Cache middleware for Express routes
exports.cacheMiddleware = (duration = DEFAULT_TTL) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedResponse = await exports.getCache(key);

      if (cachedResponse) {
        return res.status(200).json(cachedResponse);
      }

      // Store original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json
      res.json = (body) => {
        // Cache the response
        exports.setCache(key, body, duration);
        // Call original json function
        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error("Cache middleware error:", error);
      next();
    }
  };
};

// Clear all vehicle-related caches
exports.clearVehicleCaches = async () => {
  await exports.deleteCachePattern("cache:*/api/vehicles*");
};

// Clear all booking-related caches
exports.clearBookingCaches = async () => {
  await exports.deleteCachePattern("cache:*/api/bookings*");
};

// Clear all trip-related caches
exports.clearTripCaches = async () => {
  await exports.deleteCachePattern("cache:*/api/trips*");
};

// Clear analytics caches
exports.clearAnalyticsCaches = async () => {
  await exports.deleteCachePattern("cache:*/api/analytics*");
  await exports.deleteCachePattern("cache:*/api/admin*");
};

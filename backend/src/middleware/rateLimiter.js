const rateLimit = require("express-rate-limit");
const { getRedisClient } = require("../config/redis");

// Create a custom Redis store for rate limiting
class RedisStore {
  constructor(options) {
    this.client = options.client;
    this.prefix = options.prefix || "rl:";
    this.resetExpiryOnChange = options.resetExpiryOnChange || false;
  }

  async increment(key) {
    const redisKey = this.prefix + key;
    const client = this.client;

    const current = await client.incr(redisKey);

    if (current === 1) {
      await client.expire(redisKey, 60); // 60 seconds window
    }

    const ttl = await client.ttl(redisKey);

    return {
      totalHits: current,
      resetTime: new Date(Date.now() + ttl * 1000),
    };
  }

  async decrement(key) {
    const redisKey = this.prefix + key;
    await this.client.decr(redisKey);
  }

  async resetKey(key) {
    const redisKey = this.prefix + key;
    await this.client.del(redisKey);
  }
}

// General API rate limiter
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests from this IP, please try again later.",
    });
  },
});

// Strict rate limiter for auth routes
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    success: false,
    message: "Too many login attempts, please try again after 15 minutes.",
  },
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many login attempts, please try again after 15 minutes.",
    });
  },
});

// Create Redis-based rate limiter
exports.createRedisRateLimiter = (windowMs, max) => {
  try {
    const redisClient = getRedisClient();

    return rateLimit({
      windowMs,
      max,
      store: new RedisStore({
        client: redisClient,
        prefix: "rate_limit:",
      }),
      message: {
        success: false,
        message: "Too many requests, please try again later.",
      },
      handler: (req, res) => {
        res.status(429).json({
          success: false,
          message: "Too many requests, please try again later.",
        });
      },
    });
  } catch (error) {
    // Fallback to memory-based rate limiter if Redis is not available
    return rateLimit({
      windowMs,
      max,
      message: {
        success: false,
        message: "Too many requests, please try again later.",
      },
    });
  }
};

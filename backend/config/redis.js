const Redis = require('ioredis');

// Fallback in-memory cache store if Redis service is unreachable
class MemoryCache {
  constructor() {
    this.store = new Map();
  }
  async get(key) {
    const data = this.store.get(key);
    if (!data) return null;
    if (data.expireAt && Date.now() > data.expireAt) {
      this.store.delete(key);
      return null;
    }
    return data.value;
  }
  async set(key, value, mode, duration) {
    let expireAt = null;
    if (mode === 'EX' && duration) {
      expireAt = Date.now() + (duration * 1000);
    }
    this.store.set(key, { value, expireAt });
    return 'OK';
  }
  async del(key) {
    this.store.delete(key);
    return 1;
  }
}

let redisClient;
let isRedisConnected = false;

try {
  redisClient = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    retryStrategy(times) {
      if (times > 3) {
        console.warn('⚠️ Redis connection failed. Falling back to MemoryCache.');
        return null; // Stop retrying and fallback
      }
      return Math.min(times * 100, 1000);
    },
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
    console.log('✅ Redis connected successfully.');
  });

  redisClient.on('error', (err) => {
    isRedisConnected = false;
  });
} catch (e) {
  console.warn('⚠️ Redis initialization error. Using MemoryCache.');
}

const memoryStore = new MemoryCache();

const cacheManager = {
  async get(key) {
    if (isRedisConnected && redisClient) {
      try { return await redisClient.get(key); } catch (e) {}
    }
    return await memoryStore.get(key);
  },
  async set(key, value, ttlSeconds = 300) {
    const valString = typeof value === 'object' ? JSON.stringify(value) : String(value);
    if (isRedisConnected && redisClient) {
      try { return await redisClient.set(key, valString, 'EX', ttlSeconds); } catch (e) {}
    }
    return await memoryStore.set(key, valString, 'EX', ttlSeconds);
  },
  async del(key) {
    if (isRedisConnected && redisClient) {
      try { return await redisClient.del(key); } catch (e) {}
    }
    return await memoryStore.del(key);
  },
};

module.exports = {
  redisClient,
  cacheManager,
  isRedisConnected: () => isRedisConnected,
};

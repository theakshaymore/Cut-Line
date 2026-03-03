const Redis = require("ioredis");

let redis = null;
let redisEnabled = false;

const initRedis = async () => {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
    });
    redis.on("error", () => {});
    await redis.ping();
    redisEnabled = true;
  } catch (_) {
    redisEnabled = false;
    redis = null;
  }
};

const getRedis = () => redis;

const setCustomerSocket = async (customerId, socketId) => {
  if (!redisEnabled) return;
  await redis.set(`socket:${customerId}`, socketId, "EX", 60 * 60 * 24);
};

const deleteCustomerSocket = async (customerId) => {
  if (!redisEnabled) return;
  await redis.del(`socket:${customerId}`);
};

const setJoinRateLimit = async (customerId, ttlSeconds = 10) => {
  if (!redisEnabled) return true;
  const key = `ratelimit:join:${customerId}`;
  const exists = await redis.exists(key);
  if (exists) return false;
  await redis.set(key, "1", "EX", ttlSeconds);
  return true;
};

const syncSalonQueueToRedis = async (salonId, queueEntries) => {
  if (!redisEnabled) return;
  const key = `salon:${salonId}:queue`;
  await redis.del(key);
  if (queueEntries.length === 0) return;
  const args = [];
  queueEntries.forEach((entry) => {
    args.push(entry.position, JSON.stringify(entry));
  });
  await redis.zadd(key, ...args);
};

const syncSalonChairsToRedis = async (salonId, chairs) => {
  if (!redisEnabled) return;
  const key = `salon:${salonId}:chairs`;
  await redis.del(key);
  if (chairs.length === 0) return;
  const payload = {};
  chairs.forEach((chair) => {
    payload[chair.id] = JSON.stringify(chair);
  });
  await redis.hset(key, payload);
};

module.exports = {
  initRedis,
  getRedis,
  setCustomerSocket,
  deleteCustomerSocket,
  setJoinRateLimit,
  syncSalonQueueToRedis,
  syncSalonChairsToRedis,
};

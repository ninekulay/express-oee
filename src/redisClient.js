const redis = require('redis');

let redisClient;

const connectRedis = async () => {
  if (!redisClient) {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = redis.createClient({
      url: url
    });
    try {
      await redisClient.connect();
      console.log('Connected to Redis');
    } catch (error) {
      console.error('Error connecting to Redis:', error);
    }
  }
  return redisClient;
};

module.exports = { connectRedis };

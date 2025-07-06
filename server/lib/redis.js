import dotenv from "dotenv";
import Redis from "ioredis"
dotenv.config(); // Load environment variables from .env file

// console.log(process.env.UPSTASH_REDIS_URL ,"env unefined"); // Log the Redis URL to verify it's loaded correctly

export const redis = new Redis(process.env.UPSTASH_REDIS_URL);
// await redis.set('foo', 'bar');
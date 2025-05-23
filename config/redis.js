import dotenv from 'dotenv';
dotenv.config();

import Redis from "ioredis";

const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on("connect", () => console.log("✅ Connected to Upstash Redis with ioredis"));
redisClient.on("error", (err) => console.error("Redis Error:", err));


export default redisClient



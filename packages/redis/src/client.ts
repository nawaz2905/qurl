import "dotenv/config";
import Redis from "ioredis";

declare global {
    var _redis: Redis | undefined;
}

const redis = global._redis ?? new Redis(process.env.REDIS_URL as string);

if(process.env.NODE_ENV !== "production"){
    global._redis = redis;
}

export {redis};
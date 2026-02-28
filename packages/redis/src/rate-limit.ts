import {redis} from './client';

interface RateLimitOptions{
    key: string;
    limit: number;
    windowSeconds: number;
}

export async function rateLimit({
    key,
    limit,
    windowSeconds,
}:RateLimitOptions){

    const count = await redis.incr(key);
    
    if(count === 1){
        await redis.expire(key, windowSeconds);
    }
    const remaining = limit - count;

    return {
        success: count <= limit,
        remaining: remaining > 0 ? remaining : 0,
    };
}
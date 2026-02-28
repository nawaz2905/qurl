import {redis} from "./client";

export async function setCache(
    key: string,
    value: string,
    ttlSeconds: number
){
    await redis.set(key, value, "EX", ttlSeconds)
}
export async function getCache(key: string){
    return redis.get(key);
}
export async function deleteCache(key: string){
    await redis.del(key);

}
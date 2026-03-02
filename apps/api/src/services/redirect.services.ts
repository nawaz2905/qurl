import {prisma } from "@repo/db/client"
import {getCache, setCache} from "@repo/redis"

export async function handleRedirect(shortCode: string){
    const cacheKey = `url:${shortCode}`;
   
     //here we check the redis cache
    const cached = await getCache(cacheKey);
    if(cached){
        //increment db click counter
        await prisma.url.update({
            where:{shortCode},
            data:{clicks:{increment: 1}}
        });
        return cached;
    }
    // fetch from db
    const url = await prisma.url.findUnique({
        where:{shortCode},

    });
    if(!url){
        throw new Error("Short link not found");
    }

    //increament clicks counter
    await prisma.url.update({
        where:{shortCode},
        data:{clicks:{increament: 1}},
    });

    // save click event
    await prisma.click.create({
        data:{
            urlId: url.id,
        }
    
    })

    //cache orignal url 
    await setCache(cacheKey, url.originalUrl, 3600);
    return url.originalUrl;
}
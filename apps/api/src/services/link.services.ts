import { prisma } from "@repo/db/client";
import { fraudScore } from "@repo/fraud-engine/fraud";
import { generateShortCode } from "../utils/nanoid";

interface createShortLinkInput {
    url: string,
    userId: string
}

export async function createShortLink({
    url,
    userId
}: createShortLinkInput) {

    const fraud = await fraudScore(url);
    console.log(`[Link Service] Fraud Check Result: Score=${fraud.score}, Blocked=${fraud.block}`);

    if (fraud.block) {
        throw new Error(`Blocked url. Fraud Score ${fraud.score}`);
    }
    // generate shortcode 
    let shortCode = generateShortCode();

    while (
        await prisma.url.findUnique({
            where: { shortCode },
        })
    ) {
        shortCode = generateShortCode();
    }
    //saved in db 

    const saved = await prisma.url.create({
        data: {
            originalUrl: url,
            shortCode,
            fraudScore: fraud.score,
            userId: userId ?? null,
        }
    });

    return {
        id: saved.id,
        shortlink: `http://localhost:5000/${saved.shortCode}`,
        shortCode: saved.shortCode,
        fraudScore: saved.fraudScore,
        fraudInfo: fraud, // Temporary for debug
        clicks: saved.clicks,
        createdAt: saved.createdAt,
    };
}

export async function getUserLinks(userId: string) {
    return await prisma.url.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
}
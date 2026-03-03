import { prisma } from "@repo/db/client";
import { fraudScore } from "@repo/fraud-engine/fraud";
import { generateShortCode } from "../utils/nanoid";

interface createShortLinkInput {
    url: string,
    userId?: string
}

export async function createShortLink({
    url,
    userId
}: createShortLinkInput) {

    //fraud check
    const fraud = await fraudScore(url);

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
        deta: {
            originalUrl: url,
            shortCode,
            fraudScore: fraud.score,
            userId: userId ?? null,
        }
    });

    return {
        id: saved.id,
        shortCode: saved.shortCode,
        fraudScore: saved.fraudScore,
        clicks: saved.clicks,
        createdAt: saved.createdAt,
    };
}
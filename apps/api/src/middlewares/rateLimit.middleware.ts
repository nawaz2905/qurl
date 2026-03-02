import { NextFunction, Request, Response } from "express"
import { rateLimit } from "@repo/redis"

export async function rateLimitMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const key = `rate${req.ip}`;

        const result = await rateLimit({
            key,
            limit: 10,
            windowSeconds: 60,
        })
        if (!result.success) {
            res.status(429).json({
                success: false,
                error: "Too many request Please try again later"
            });
        }
        next();

    } catch (e) {
        res.status(500).json({
            success: false,
            error: "Rate Limiting failed"
        });
    }
}
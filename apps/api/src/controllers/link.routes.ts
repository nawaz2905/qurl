import { Request, Response } from "express"
import { linkSchema } from "../schemas/link.schema"
import { createShortLink, getUserLinks, deleteShortLink } from "../services/link.services"


export async function createLink(req: Request, res: Response) {
    try {
        const parsed = await linkSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                error: parsed.error.flatten(),
            });
        }
        const result = await createShortLink({
            url: parsed.data.url,
            userId: (req as any).userId,
        });
        return res.status(201).json({
            success: true,
            shortlink: result.shortlink,
            fraudScore: (result as any).fraudScore, // For debug
            fraudInfo: (result as any).fraudInfo // For debug
        });

    } catch (error: any) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

export async function getLinks(req: Request, res: Response) {
    try {
        const userId = (req as any).userId;
        const links = await getUserLinks(userId);
        return res.status(200).json({
            success: true,
            links,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}

export async function deleteLink(req: Request, res: Response) {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;

        const result = await deleteShortLink(id, userId);
        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}

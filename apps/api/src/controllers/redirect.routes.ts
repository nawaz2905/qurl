import { Request, Response } from "express";
import { handleRedirect } from "../services/redirect.services";

export async function redirectHandler(req: Request, res: Response) {
    try {
        const { shortcode } = req.params;

        if (!shortcode || typeof shortcode !== 'string') {
            return res.status(400).json({
                success: false,
                error: "Invalid short code"
            });
        }

        const originalUrl = await handleRedirect(shortcode);
        return res.redirect(originalUrl);

    } catch (e: any) {
        res.status(404).json({
            success: false,
            error: "Shortcode not found"
        })

    }
}
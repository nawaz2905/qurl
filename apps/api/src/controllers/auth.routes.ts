import {Request, Response} from "express";
import {handleRedirect} from "../services/redirect.services";

export async function redirectHandler(req: Request, res: Response){
    try{
        const {shortCode} = req.params;

        if (!shortCode || typeof shortCode !== 'string') {
            return res.status(400).json({
                success: false,
                error: "Invalid short code"
            });
        }

        const originalUrl = await handleRedirect(shortCode);
        return res.redirect(originalUrl)

    }catch(e: any){
        res.status(404).json({
            success: false,
            error: e.message || "Link not found"
        })

    }
}
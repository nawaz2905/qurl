import {Request, Response} from "express"
import {linkSchema} from "../schemas/link.schema"
import {createShortLink} from "../services/link.services"


export async function createLink(req: Request, res:Response){
    try{
        const parsed = await linkSchema.safeParse(req.body);

        if(!parsed.success){
            return res.status(400).json({
                success: false,
                error:parsed.error.flatten(),
            });
        }
        const result = await createShortLink({
            url: parsed.data.url,
            userId: (req as any ).userId,
        });
        return res.status(201).json({
            success: true,
            data: result
        });

    }catch(error: any ){
        return res.status(400).json({
            success: false,
            error: error.message 
        });
    }
}

import {type Request, type Response, type NextFunction} from "express";
import jwt, {JwtPayload} from 'jsonwebtoken';
import {JWT_PASSCODE} from "@repo/backend-common/config";


export interface AuthRequest extends Request{
    userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) =>{
    const authHeader = req.headers["authorization"];

    if(!authHeader || !authHeader.startsWith("Bearer")){
        return res.status(401).json({
            message:"Access Denied"
        })
    }
    const token = authHeader.split("")[1];
    try{
        const decode = jwt.verify(token as string, JWT_PASSCODE)
        req.userId = (decode as JwtPayload).userId
        next();
    }catch(e){
        console.log(e);
        return res.status(401).json({
            message:"Access denied!"
        })
        
    }
}
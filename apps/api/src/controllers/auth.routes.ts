import { Request, Response } from 'express'
import { signupSchema, signinSchema } from "../schemas/auth.schema";
import { signin, signinWithGoogle, signup } from "../services/auth.services";


export async function signupHandler(req: Request, res: Response) {
    try {
        const parsed = signupSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "invalid fromat"
            });
        }

        const user = await signup(parsed.data.email, parsed.data.password);

        return res.status(201).json({
            success: true,
            message: "Successfully signed up"
        });


    } catch (error: any) {
        return res.status(404).json({
            success: false,
            error: error.message
        });

    }
}

export async function signinHandler(req: Request, res: Response) {
    try{
        const parsed = await signinSchema.safeParse(req.body);

        if(!parsed.success){
            return res.status(400).json({
                success: false,
                error: parsed.error.flatten(),
            });
        }

        const token = await signin(parsed.data.email, parsed.data.password);
        return res.status(201).json({
            success: true,
            token,
            message: "Sigin in successfull"

        });

    }catch(error: any ){
        return res.status(404).json({
            success: false,
            error: error.message
        })
    }

}

export async function googleSigninHandler(req: Request, res: Response) {
    try {
        const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";

        if (!email) {
            return res.status(400).json({
                success: false,
                error: "Email is required",
            });
        }

        const token = await signinWithGoogle(email);

        return res.status(200).json({
            success: true,
            token,
            message: "Google sign in successful",
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}

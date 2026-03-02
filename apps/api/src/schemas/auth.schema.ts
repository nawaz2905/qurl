import {z} from "zod";

export const signupSchema = z.object({
    email: z.string().email(),
    password:z.string().min(8, "Password must atleast 8 characters " ).max(20)
});

export const signinSchema  = z.object({
    email: z.string().email(),
    password:z.string().min(8, "Password must atleast 8 characters").max(20)
});
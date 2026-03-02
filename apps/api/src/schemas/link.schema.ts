import {z} from "zod";

export const linkSchema = z.object({
    url: z.string().min(1).url()

})
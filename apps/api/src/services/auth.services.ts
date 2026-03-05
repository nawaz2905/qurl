import { prisma } from "@repo/db/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_PASSCODE } from "@repo/backend-common/config"

export async function signup(email: string, password: string) {
    const existing = await prisma.user.findUnique({
        where: { email },
    });

    if (existing) {
        throw new Error("User alredy exist")
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: {
            email,
            passwordHash: hashed
        }
    });
    return user;

}

export async function signin(email: string, password: string) {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error("invalid credentials");
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
        throw new Error("Worng password!")
    }
    const token = jwt.sign(
        { userId: user.id },
        JWT_PASSCODE
    )
    return token;

}
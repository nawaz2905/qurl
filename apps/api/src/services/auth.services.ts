import { prisma } from "@repo/db/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_PASSCODE } from "@repo/backend-common/config"
import { randomBytes } from "crypto";

function issueToken(userId: string) {
    return jwt.sign(
        { userId },
        JWT_PASSCODE
    );
}

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

    if (!user || !user.passwordHash) {
        throw new Error("invalid credentials");
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
        throw new Error("Worng password!")
    }

    return issueToken(user.id);
}

export async function signinWithGoogle(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
        throw new Error("Email is required");
    }

    let user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                passwordHash: await bcrypt.hash(randomBytes(32).toString("hex"), 12),
            },
        });
    }

    return issueToken(user.id);

}

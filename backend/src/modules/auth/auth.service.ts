import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";
import { env } from "../../config/env";
import { TelegramUser } from "./telegramAuth";

export async function upsertTelegramUser(tgUser: TelegramUser) {
  return prisma.user.upsert({
    where: { telegramId: String(tgUser.id) },
    create: {
      telegramId: String(tgUser.id),
      firstName: tgUser.first_name,
      lastName: tgUser.last_name,
      username: tgUser.username,
      photoUrl: tgUser.photo_url,
    },
    update: {
      firstName: tgUser.first_name,
      lastName: tgUser.last_name,
      username: tgUser.username,
      photoUrl: tgUser.photo_url,
    },
  });
}

// userId is null for admin tokens (admin is not a real user row).
export function signToken(userId: number | null, isAdmin: boolean): string {
  return jwt.sign({ userId, isAdmin }, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: number | null; isAdmin: boolean } | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as { userId: number | null; isAdmin: boolean };
  } catch {
    return null;
  }
}

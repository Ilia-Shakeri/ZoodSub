import { Request, Response } from "express";
import { validateTelegramInitData } from "./telegramAuth";
import { upsertTelegramUser, signToken } from "./auth.service";
import { env } from "../../config/env";

export async function telegramAuth(req: Request, res: Response) {
  const { initData } = req.body as { initData?: string };

  if (!initData) {
    return res.status(400).json({ error: "initData is required" });
  }

  // In dev mode allow a bypass
  if (env.NODE_ENV === "development" && initData === "dev_bypass") {
    const user = await upsertTelegramUser({
      id: 999999,
      first_name: "Dev",
      last_name: "User",
      username: "devuser",
      auth_date: Math.floor(Date.now() / 1000),
    });
    const token = signToken(user.id, user.isAdmin);
    return res.json({ token, user });
  }

  const tgUser = validateTelegramInitData(initData);
  if (!tgUser) {
    return res.status(401).json({ error: "Invalid Telegram initData" });
  }

  const user = await upsertTelegramUser(tgUser);
  const token = signToken(user.id, user.isAdmin);
  return res.json({ token, user });
}

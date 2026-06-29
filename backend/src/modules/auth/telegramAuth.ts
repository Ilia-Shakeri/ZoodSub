import crypto from "crypto";
import { env } from "../../config/env";

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
}

export function validateTelegramInitData(initData: string): TelegramUser | null {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return null;

    params.delete("hash");
    const sortedKeys = Array.from(params.keys()).sort();
    const dataCheckString = sortedKeys.map((k) => `${k}=${params.get(k)}`).join("\n");

    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(env.TELEGRAM_BOT_TOKEN)
      .digest();

    const expectedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (expectedHash !== hash) return null;

    const authDate = parseInt(params.get("auth_date") || "0");
    const fiveMinutes = 5 * 60;
    if (Date.now() / 1000 - authDate > fiveMinutes) return null;

    const userParam = params.get("user");
    if (!userParam) return null;

    return JSON.parse(userParam) as TelegramUser;
  } catch {
    return null;
  }
}

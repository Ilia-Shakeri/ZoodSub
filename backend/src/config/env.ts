import dotenv from "dotenv";
dotenv.config();

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN!,
  JWT_SECRET: process.env.JWT_SECRET || "changeme_jwt_secret",
  PORT: parseInt(process.env.PORT || "3001"),
  NODE_ENV: process.env.NODE_ENV || "development",
  ADMIN_SECRET: process.env.ADMIN_SECRET || "changeme_admin_secret",
  ADMIN_CHAT_ID: process.env.ADMIN_CHAT_ID || "",
};

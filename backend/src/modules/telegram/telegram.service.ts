import { env } from "../../config/env";

interface OrderNotification {
  orderNumber: string;
  fullName: string;
  totalPrice: number;
  deliveryMethod: string;
  telegramId?: string;
}

async function sendTelegramMessage(chatId: string, text: string) {
  if (!env.TELEGRAM_BOT_TOKEN) return;
  try {
    await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      }
    );
  } catch (err) {
    console.error("Telegram send error:", err);
  }
}

export async function notifyUserOrderCreated(
  telegramId: string,
  order: OrderNotification
) {
  const text = `✅ <b>سفارش شما ثبت شد!</b>\n\nشماره سفارش: <code>${order.orderNumber}</code>\nمبلغ: ${order.totalPrice.toLocaleString()} تومان\nروش تحویل: ${order.deliveryMethod}\n\nبه زودی با شما تماس می‌گیریم.`;
  await sendTelegramMessage(telegramId, text);
}

export async function notifyAdminNewOrder(
  adminChatId: string,
  order: OrderNotification
) {
  const text = `🔔 <b>سفارش جدید!</b>\n\nشماره: <code>${order.orderNumber}</code>\nنام: ${order.fullName}\nمبلغ: ${order.totalPrice.toLocaleString()} تومان\nتحویل: ${order.deliveryMethod}`;
  await sendTelegramMessage(adminChatId, text);
}

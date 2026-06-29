"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchOrder } from "@/services/api";
import { Order } from "@/types/api";
import { CheckCircle2, Package, Home, HeadphonesIcon, Loader2, Copy } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "در انتظار پرداخت",
  PAID: "پرداخت شده",
  PROCESSING: "در حال پردازش",
  DELIVERED: "تحویل داده شده",
  CANCELLED: "لغو شده",
  REFUNDED: "برگشت وجه",
};

const DELIVERY_LABELS: Record<string, string> = {
  "Telegram Message": "پیام تلگرام",
  "Email": "ایمیل",
  "WhatsApp": "واتس‌اپ",
  "Manual Support": "پشتیبانی دستی",
};

export default function OrderSuccessPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      window.Telegram.WebApp.BackButton.hide();
    }
    fetchOrder(orderNumber)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderNumber]);

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-slate-400">
        سفارش یافت نشد
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 pb-32">
      <main className="p-4 max-w-lg mx-auto space-y-4 pt-10">
        {/* Success icon */}
        <div className="flex flex-col items-center text-center gap-3 py-6">
          <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">سفارش ثبت شد!</h1>
          <p className="text-slate-400 text-sm">سفارش شما با موفقیت ثبت شد و به‌زودی پردازش می‌شود.</p>
        </div>

        {/* Order number */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={copyOrderNumber}
              className="text-xs text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              {copied ? "کپی شد!" : "کپی"}
            </button>
            <div className="text-right">
              <p className="text-xs text-slate-400 mb-1">شماره سفارش</p>
              <p className="text-lg font-bold text-cyan-400 font-mono">{order.orderNumber}</p>
            </div>
          </div>
        </div>

        {/* Order details */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-300 text-right mb-2">جزئیات سفارش</h2>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <span className="text-cyan-400 font-bold">
                {item.total.toLocaleString("fa-IR")} تومان
              </span>
              <span className="text-slate-300 text-right">
                {item.title} — {item.variantName} × {item.quantity}
              </span>
            </div>
          ))}
          <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
            <span className="text-white font-bold">
              {order.totalPrice.toLocaleString("fa-IR")} تومان
            </span>
            <span className="text-slate-400 text-sm">مبلغ کل</span>
          </div>
        </div>

        {/* Status + delivery */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-4 space-y-2 text-sm text-right">
          <div className="flex justify-between">
            <span className="text-yellow-400 font-bold">{STATUS_LABELS[order.status] || order.status}</span>
            <span className="text-slate-400">وضعیت</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">{DELIVERY_LABELS[order.deliveryMethod] || order.deliveryMethod}</span>
            <span className="text-slate-400">روش تحویل</span>
          </div>
        </div>

        {/* Payment instructions */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 text-right space-y-2">
          <div className="flex items-center justify-end gap-2 mb-2">
            <h3 className="text-sm font-bold text-blue-300">راهنمای پرداخت</h3>
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xs text-blue-200/80 leading-relaxed">
            پس از ثبت سفارش، ادمین با شما از طریق روش تحویل انتخابی تماس خواهد گرفت. لطفاً مبلغ سفارش را پس از تأیید ادمین پرداخت نمایید. اطلاعات اکانت پس از تأیید پرداخت ارسال می‌شود.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/")}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Home className="w-5 h-5" />
            بازگشت به خانه
          </button>
          <button
            onClick={() => {
              if (window.Telegram?.WebApp?.openTelegramLink) {
                window.Telegram.WebApp.openTelegramLink("https://t.me/ZoodSubSupport");
              }
            }}
            className="w-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <HeadphonesIcon className="w-5 h-5" />
            تماس با پشتیبانی
          </button>
        </div>
      </main>
    </div>
  );
}

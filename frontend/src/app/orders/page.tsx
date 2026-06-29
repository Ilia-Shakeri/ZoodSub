"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchUserOrders } from "@/services/api";
import { Order } from "@/types/api";
import {
  ChevronLeft, Clock, CheckCircle2, XCircle,
  RefreshCw, Loader2, ShoppingBag, Copy, ChevronDown, ChevronUp,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: "در انتظار پرداخت", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30", icon: <Clock className="w-3 h-3" /> },
  PAID: { label: "پرداخت شده", color: "text-blue-400 bg-blue-400/10 border-blue-400/30", icon: <CheckCircle2 className="w-3 h-3" /> },
  PROCESSING: { label: "در حال پردازش", color: "text-purple-400 bg-purple-400/10 border-purple-400/30", icon: <RefreshCw className="w-3 h-3" /> },
  DELIVERED: { label: "تحویل داده شده", color: "text-green-400 bg-green-400/10 border-green-400/30", icon: <CheckCircle2 className="w-3 h-3" /> },
  CANCELLED: { label: "لغو شده", color: "text-red-400 bg-red-400/10 border-red-400/30", icon: <XCircle className="w-3 h-3" /> },
  REFUNDED: { label: "برگشت وجه", color: "text-orange-400 bg-orange-400/10 border-orange-400/30", icon: <RefreshCw className="w-3 h-3" /> },
};

const DELIVERY_LABELS: Record<string, string> = {
  "Telegram Message": "پیام تلگرام",
  "Email": "ایمیل",
  "WhatsApp": "واتس‌اپ",
  "Manual Support": "پشتیبانی دستی",
};

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const status = STATUS_CONFIG[order.status] || { label: order.status, color: "text-slate-400 bg-slate-400/10 border-slate-400/30", icon: null };

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const createdAt = new Date(order.createdAt).toLocaleDateString("fa-IR", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden transition-all">
      {/* Card header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${status.color}`}>
            {status.icon}
            {status.label}
          </span>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {createdAt}
          </span>
        </div>

        <div className="flex items-start justify-between gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-slate-400 hover:text-white transition-colors mt-1"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <div className="text-right flex-1">
            <p className="text-xs text-slate-400 mb-1">
              {order.items.length} محصول • روش تحویل: {DELIVERY_LABELS[order.deliveryMethod] || order.deliveryMethod}
            </p>
            <button
              onClick={copyOrderNumber}
              className="font-mono text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 mr-auto"
            >
              {copied ? "کپی شد ✓" : order.orderNumber}
              {!copied && <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/60">
          <span className="text-base font-bold text-white">
            {order.totalPrice.toLocaleString("fa-IR")}
            <span className="text-xs font-normal text-slate-400 mr-1">تومان</span>
          </span>
          <span className="text-xs text-slate-400">مبلغ کل</span>
        </div>
      </div>

      {/* Expanded order items */}
      {expanded && (
        <div className="border-t border-slate-700/60 bg-slate-900/40 p-4 space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <span className="text-cyan-400 font-bold shrink-0">
                {item.total.toLocaleString("fa-IR")} ت
              </span>
              <span className="text-slate-300 text-right text-xs">
                {item.title} — {item.variantName} × {item.quantity}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.BackButton.show();
      tg.BackButton.onClick(() => router.back());
      return () => tg.BackButton.hide();
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("zoodsub_token") : null;
      if (!token) {
        if (!cancelled) {
          setError("برای مشاهده سفارشات ابتدا وارد شوید.");
          setLoading(false);
        }
        return;
      }
      try {
        const data = await fetchUserOrders();
        if (!cancelled) setOrders(data);
      } catch {
        if (!cancelled) setError("خطا در دریافت سفارشات");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 pb-36">
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/60">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">سفارشات من</h1>
          <button
            onClick={() => router.back()}
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            بازگشت
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-sm text-center">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
            <ShoppingBag className="w-14 h-14 opacity-20" />
            <p className="text-sm">هنوز سفارشی ثبت نکرده‌اید</p>
            <button
              onClick={() => router.push("/")}
              className="text-cyan-400 text-xs hover:underline"
            >
              مشاهده محصولات
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500 text-right">{orders.length} سفارش</p>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </>
        )}
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { createOrder } from "@/services/api";
import { DeliveryForm } from "@/types/api";
import { ChevronLeft, Loader2 } from "lucide-react";

const DELIVERY_METHODS = [
  "Telegram Message",
  "Email",
  "WhatsApp",
  "Manual Support",
] as const;

const DELIVERY_LABELS: Record<string, string> = {
  "Telegram Message": "پیام تلگرام",
  "Email": "ایمیل",
  "WhatsApp": "واتس‌اپ",
  "Manual Support": "پشتیبانی دستی",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<DeliveryForm>({
    fullName: "",
    phone: "",
    email: "",
    telegramUsername: "",
    country: "Iran",
    city: "",
    address: "",
    deliveryMethod: "Telegram Message",
    note: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.BackButton.show();
      tg.BackButton.onClick(() => router.back());
      const prefillTelegramUsername = () => {
        const user = tg.initDataUnsafe?.user;
        if (user?.username) {
          setForm((f) => ({ ...f, telegramUsername: user.username || "" }));
        }
      };
      prefillTelegramUsername();
      return () => tg.BackButton.hide();
    }
  }, [router]);

  // Redirect to home when cart is empty — must run as an effect, never during
  // render (calling router.replace during render crashes SSR prerender with
  // "location is not defined" and warns about updating during render).
  useEffect(() => {
    if (items.length === 0) {
      router.replace("/");
    }
  }, [items.length, router]);

  if (items.length === 0) {
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.fullName || !form.phone || !form.email || !form.country) {
      setError("لطفاً فیلدهای ضروری را پر کنید.");
      return;
    }
    setLoading(true);
    try {
      const order = await createOrder(items, form);
      clearCart();
      router.push(`/order/success/${order.orderNumber}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "خطایی رخ داد";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-slate-800/60 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-right";

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 pb-32">
      <header className="flex justify-between items-center p-4 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-800/50">
        <h1 className="text-lg font-bold text-white">اطلاعات تحویل</h1>
        <button
          onClick={() => router.back()}
          className="text-slate-400 hover:text-white flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          بازگشت
        </button>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-4">
        {/* Order summary */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-4">
          <h2 className="text-sm font-bold text-slate-300 mb-3 text-right">خلاصه سفارش</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-cyan-400 font-bold">
                  {(item.price * item.quantity).toLocaleString("fa-IR")} تومان
                </span>
                <span className="text-slate-300">
                  {item.title} ({item.variantName}) × {item.quantity}
                </span>
              </div>
            ))}
            <div className="border-t border-slate-700 pt-2 flex justify-between items-center font-bold">
              <span className="text-white text-base">
                {total().toLocaleString("fa-IR")} تومان
              </span>
              <span className="text-slate-400 text-sm">جمع کل</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-300 text-right mb-1">اطلاعات تماس</h2>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              placeholder="نام و نام خانوادگی *"
              className={inputClass}
            />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              type="tel"
              placeholder="شماره تماس *"
              className={inputClass}
            />
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              type="email"
              placeholder="ایمیل *"
              className={`${inputClass} text-left`}
            />
            <input
              name="telegramUsername"
              value={form.telegramUsername}
              onChange={handleChange}
              placeholder="یوزرنیم تلگرام (اختیاری)"
              className={`${inputClass} text-left`}
            />
          </div>

          <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-300 text-right mb-1">اطلاعات محل</h2>
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
              required
              placeholder="کشور *"
              className={inputClass}
            />
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="شهر (اختیاری)"
              className={inputClass}
            />
          </div>

          <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-300 text-right mb-2">روش تحویل *</h2>
            <div className="grid grid-cols-2 gap-2">
              {DELIVERY_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, deliveryMethod: method }))}
                  className={`p-3 rounded-xl text-xs font-bold transition-all border ${
                    form.deliveryMethod === method
                      ? "bg-cyan-500/20 text-cyan-400 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.25)]"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  {DELIVERY_LABELS[method]}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-4">
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="یادداشت سفارش (اختیاری)"
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm text-right">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                در حال ثبت سفارش...
              </>
            ) : (
              "ثبت سفارش"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}

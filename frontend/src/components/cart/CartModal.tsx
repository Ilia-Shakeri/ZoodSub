"use client";

import { useCartStore } from "@/store/cartStore";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

interface CartModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CartModal({ open, onClose }: CartModalProps) {
  const { items, removeItem, updateQuantity, total, count } = useCartStore();
  const router = useRouter();

  if (!open) return null;

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-t-3xl p-6 pb-safe max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-cyan-400" />
            سبد خرید ({count()} مورد)
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12">
            <ShoppingBag className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">سبد خرید خالی است</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="bg-slate-800/60 rounded-2xl p-4 flex gap-3 items-start border border-slate-700/50"
                >
                  <div className="flex-1 text-right">
                    <p className="text-sm font-bold text-white">{item.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.variantName}</p>
                    <p className="text-sm font-bold text-cyan-400 mt-2">
                      {(item.price * item.quantity).toLocaleString("fa-IR")} تومان
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 bg-slate-700 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        className="text-slate-300 hover:text-white p-0.5"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <span className="text-white font-bold text-sm w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        className="text-slate-300 hover:text-white p-0.5"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-700 pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-white">
                  {total().toLocaleString("fa-IR")} تومان
                </span>
                <span className="text-sm text-slate-400">جمع کل</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-cyan-500/30"
              >
                ادامه و تکمیل سفارش
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

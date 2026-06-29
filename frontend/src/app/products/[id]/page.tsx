"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchProduct } from "@/services/api";
import { Product, Variant } from "@/types/api";
import { useCartStore } from "@/store/cartStore";
import CartModal from "@/components/cart/CartModal";
import {
  ChevronLeft, Zap, ShieldCheck, RefreshCw, Headphones,
  ShoppingCart, Loader2, Plus, Minus, Check,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, string> = {
  music: "🎵", video: "🎬", ai: "🤖", gaming: "🎮",
  tools: "🔧", vpn: "🛡️", education: "📚",
};

function getBadgeColor(slug: string) {
  const map: Record<string, string> = {
    music: "from-green-400 to-emerald-600",
    video: "from-red-500 to-red-700",
    ai: "from-teal-400 to-cyan-600",
    gaming: "from-green-600 to-emerald-700",
    tools: "from-sky-400 to-blue-500",
    vpn: "from-cyan-500 to-blue-600",
    education: "from-orange-400 to-amber-600",
  };
  return map[slug] || "from-purple-500 to-indigo-600";
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const { addItem, count } = useCartStore();

  useEffect(() => {
    fetchProduct(parseInt(id))
      .then((p) => {
        setProduct(p);
        setSelectedVariant(p.variants[0] ?? null);
      })
      .catch(() => router.replace("/products"))
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.Telegram?.WebApp) return;
    const tg = window.Telegram.WebApp;
    tg.BackButton.show();
    tg.BackButton.onClick(() => router.back());
    return () => tg.BackButton.hide();
  }, [router]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      title: product.title,
      variantName: selectedVariant.name,
      price: selectedVariant.price,
      quantity,
      image: product.image ?? undefined,
    });
    if (typeof window !== "undefined" && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
    }
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1800);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const gradientClass = getBadgeColor(product.category.slug);
  const icon = CATEGORY_ICONS[product.category.slug] ?? "📦";
  const isOutOfStock = selectedVariant
    ? selectedVariant.stock !== -1 && selectedVariant.stock < 1
    : false;
  const discount =
    selectedVariant?.oldPrice
      ? Math.round((1 - selectedVariant.price / selectedVariant.oldPrice) * 100)
      : null;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 pb-36">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCartOpen(true)}
            className="relative text-slate-400 hover:text-white"
          >
            <ShoppingCart className="w-6 h-6" />
            {count() > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-cyan-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {count()}
              </span>
            )}
          </button>
        </div>
        <h1 className="text-base font-bold text-white truncate max-w-[200px]">{product.title}</h1>
        <button
          onClick={() => router.back()}
          className="text-slate-400 hover:text-white flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          بازگشت
        </button>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-4">
        {/* Product hero */}
        <div className={`bg-gradient-to-br ${gradientClass} rounded-3xl p-8 flex flex-col items-center gap-3 shadow-2xl relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20 rounded-3xl" />
          <div className="relative text-6xl">{icon}</div>
          <h2 className="relative text-2xl font-extrabold text-white text-center drop-shadow-md">
            {product.title}
          </h2>
          {product.category && (
            <span className="relative bg-white/20 text-white text-xs px-3 py-1 rounded-full font-semibold backdrop-blur-sm">
              {product.category.name}
            </span>
          )}
          {product.deliveryType === "instant" && (
            <span className="relative bg-yellow-500/30 text-yellow-200 text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3" /> تحویل فوری
            </span>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-4">
            <p className="text-sm text-slate-300 leading-relaxed text-right">
              {product.description}
            </p>
          </div>
        )}

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <Zap className="w-4 h-4 text-yellow-400" />, label: "تحویل آنی" },
            { icon: <ShieldCheck className="w-4 h-4 text-green-400" />, label: "تضمین کیفیت" },
            { icon: <RefreshCw className="w-4 h-4 text-blue-400" />, label: "ضمانت بازگشت" },
            { icon: <Headphones className="w-4 h-4 text-purple-400" />, label: "پشتیبانی ۲۴/۷" },
            { icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />, label: "رمزنگاری امن" },
            { icon: <Check className="w-4 h-4 text-emerald-400" />, label: "اصالت‌ سنجی" },
          ].map((b, i) => (
            <div
              key={i}
              className="bg-slate-800/40 border border-slate-700 rounded-xl p-3 flex flex-col items-center gap-1"
            >
              {b.icon}
              <span className="text-[10px] text-slate-400 text-center">{b.label}</span>
            </div>
          ))}
        </div>

        {/* Variant selector */}
        {product.variants.length > 0 && (
          <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-300 text-right">انتخاب پلن</h3>
            <div className="grid grid-cols-2 gap-2">
              {product.variants.map((variant) => {
                const outOfStock = variant.stock !== -1 && variant.stock < 1;
                const selected = selectedVariant?.id === variant.id;
                return (
                  <button
                    key={variant.id}
                    onClick={() => !outOfStock && setSelectedVariant(variant)}
                    disabled={outOfStock}
                    className={`p-3 rounded-xl text-xs font-bold transition-all border text-right relative overflow-hidden ${
                      outOfStock
                        ? "opacity-40 cursor-not-allowed bg-slate-800 border-slate-700 text-slate-500"
                        : selected
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.25)]"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    {outOfStock && (
                      <span className="absolute top-1 left-1 text-[9px] text-red-400">ناموجود</span>
                    )}
                    <div className="font-bold mb-0.5">{variant.name}</div>
                    {variant.duration && (
                      <div className="text-[10px] opacity-70">{variant.duration}</div>
                    )}
                    {variant.region && (
                      <div className="text-[10px] opacity-70">{variant.region}</div>
                    )}
                    <div className="mt-1 text-cyan-400 font-extrabold">
                      {variant.price.toLocaleString("fa-IR")}
                      <span className="text-[9px] font-normal text-slate-400"> ت</span>
                    </div>
                    {variant.oldPrice && (
                      <div className="text-[9px] text-slate-500 line-through">
                        {variant.oldPrice.toLocaleString("fa-IR")}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price + quantity */}
        {selectedVariant && (
          <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-slate-700 rounded-xl p-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="text-slate-300 hover:text-white p-1.5 active:scale-90 transition-transform"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-white font-bold text-base w-7 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                className="text-slate-300 hover:text-white p-1.5 active:scale-90 transition-transform"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="text-right">
              {discount && (
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full font-bold">
                  {discount}٪ تخفیف
                </span>
              )}
              <div className="text-2xl font-extrabold text-white mt-1">
                {(selectedVariant.price * quantity).toLocaleString("fa-IR")}
                <span className="text-sm font-normal text-slate-400 mr-1">تومان</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sticky bottom buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 max-w-lg mx-auto flex gap-3 z-30">
        <button
          onClick={handleAddToCart}
          disabled={!selectedVariant || isOutOfStock}
          className={`flex-1 font-bold py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 border ${
            addedFeedback
              ? "bg-green-600/20 border-green-500 text-green-400"
              : "bg-slate-800 border-slate-600 text-slate-300 hover:border-cyan-500 hover:text-cyan-400"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {addedFeedback ? (
            <><Check className="w-5 h-5" /> اضافه شد</>
          ) : (
            <><ShoppingCart className="w-5 h-5" /> افزودن به سبد</>
          )}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={!selectedVariant || isOutOfStock}
          className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-cyan-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          خرید الان
        </button>
      </div>

      <CartModal open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

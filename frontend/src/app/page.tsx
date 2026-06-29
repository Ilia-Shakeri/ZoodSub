"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authTelegram, fetchCategories, fetchProducts } from "@/services/api";
import { useUserStore } from "@/store/userStore";
import { useCartStore } from "@/store/cartStore";
import { Category, Product, UserProfile } from "@/types/api";
import CartModal from "@/components/cart/CartModal";
import { Search, ShoppingCart, Zap, Star } from "lucide-react";

const CATEGORY_GRADIENTS: Record<string, string> = {
  music: "from-green-400 to-emerald-600",
  video: "from-red-500 to-red-700",
  ai: "from-teal-400 to-cyan-600",
  gaming: "from-green-600 to-emerald-700",
  tools: "from-sky-400 to-blue-500",
  vpn: "from-cyan-500 to-blue-600",
  education: "from-orange-400 to-amber-600",
};

function ProductCard({ product }: { product: Product }) {
  const gradient = CATEGORY_GRADIENTS[product.category.slug] || "from-purple-500 to-indigo-600";
  const icon = product.category.icon || "📦";
  const lowestPrice = product.variants[0]?.price;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group bg-slate-800/40 border border-slate-700 hover:border-cyan-500/50 rounded-2xl p-4 flex flex-col gap-2 transition-all active:scale-95"
    >
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-lg`}
      >
        {icon}
      </div>
      <div className="text-right flex-1">
        <h3 className="text-xs font-bold text-white leading-tight">{product.title}</h3>
        {product.description && (
          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
      </div>
      <div className="bg-slate-900/70 rounded-xl px-3 py-2 text-center border border-slate-700/50">
        {lowestPrice ? (
          <span className="text-xs font-bold text-cyan-400">
            از {lowestPrice.toLocaleString("fa-IR")} ت
          </span>
        ) : (
          <span className="text-xs text-slate-500">بدون موجودی</span>
        )}
      </div>
      {product.deliveryType === "instant" && (
        <span className="flex items-center justify-center gap-1 text-[9px] text-yellow-400">
          <Zap className="w-2.5 h-2.5" /> تحویل فوری
        </span>
      )}
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-4 space-y-3 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-slate-700" />
      <div className="space-y-1.5">
        <div className="h-3 bg-slate-700 rounded w-4/5 ml-auto" />
        <div className="h-2.5 bg-slate-700/60 rounded w-3/5 ml-auto" />
      </div>
      <div className="h-8 bg-slate-700/50 rounded-xl" />
    </div>
  );
}

export default function HomePage() {
  const { user, setAuth } = useUserStore();
  const { count } = useCartStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authDone, setAuthDone] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Telegram auth on mount
  useEffect(() => {
    const init = async () => {
      try {
        if (typeof window !== "undefined") {
          const tg = window.Telegram?.WebApp;
          if (tg) {
            tg.expand();
            tg.ready();
          }
          const initData =
            tg?.initData && tg.initData !== "" ? tg.initData : "dev_bypass";
          const { token, user: tgUser } = await authTelegram(initData);
          localStorage.setItem("zoodsub_token", token);
          setAuth(tgUser as UserProfile, token);
        }
      } catch {
        // Continue as guest
      } finally {
        setAuthDone(true);
      }
    };
    init();
  }, [setAuth]);

  // Fetch categories
  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  // Fetch products when auth done + filters change
  useEffect(() => {
    if (!authDone) return;
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts(
          activeCategory !== "all" ? activeCategory : undefined,
          debouncedSearch || undefined
        );
        if (!cancelled) setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [authDone, activeCategory, debouncedSearch]);

  const featuredProducts = products.filter((p) => p.isFeatured);
  const cartCount = count();
  const greeting = user?.firstName ? `سلام ${user.firstName} 👋` : "سلام!";

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 pb-36">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/60">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setCartOpen(true)}
            className="relative text-slate-400 hover:text-white transition-colors p-1"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-[10px] font-extrabold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                {cartCount}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2">
            {user && (
              <span className="text-xs text-slate-400 font-medium">{greeting}</span>
            )}
            <h1 className="text-xl font-extrabold">
              <span className="text-purple-400">زود</span>
              <span className="text-cyan-400">ساب</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-5">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی محصول..."
            className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl py-3 pr-10 pl-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all text-right"
          />
        </div>

        {/* Category chips */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory("all")}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                activeCategory === "all"
                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600"
              }`}
            >
              همه
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  activeCategory === cat.slug
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600"
                }`}
              >
                {cat.icon && <span>{cat.icon}</span>}
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Featured products horizontal scroll */}
        {!loading && featuredProducts.length > 0 && !debouncedSearch && activeCategory === "all" && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">{featuredProducts.length} محصول ویژه</span>
              <h2 className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                پیشنهادهای ویژه
              </h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
              {featuredProducts.map((product) => {
                const gradient =
                  CATEGORY_GRADIENTS[product.category.slug] || "from-purple-500 to-indigo-600";
                const icon = product.category.icon || "📦";
                const lowestPrice = product.variants[0]?.price;
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="shrink-0 w-44 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 hover:border-cyan-500/40 rounded-2xl p-4 transition-all active:scale-95"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl mb-3 shadow-md`}
                    >
                      {icon}
                    </div>
                    <h3 className="text-xs font-bold text-white mb-1 text-right leading-snug">
                      {product.title}
                    </h3>
                    {lowestPrice && (
                      <p className="text-xs text-cyan-400 font-bold text-right">
                        از {lowestPrice.toLocaleString("fa-IR")} ت
                      </p>
                    )}
                    {product.deliveryType === "instant" && (
                      <span className="inline-flex items-center gap-1 text-[9px] text-yellow-400 mt-1.5">
                        <Zap className="w-2.5 h-2.5" /> تحویل فوری
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Product grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            {!loading && (
              <span className="text-xs text-slate-500">{products.length} محصول</span>
            )}
            <h2 className="text-sm font-bold text-slate-300">
              {activeCategory === "all"
                ? "همه محصولات"
                : categories.find((c) => c.slug === activeCategory)?.name || "محصولات"}
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
              <Search className="w-10 h-10 opacity-30" />
              <p className="text-sm">محصولی یافت نشد</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <CartModal open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

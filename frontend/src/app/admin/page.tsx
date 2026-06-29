"use client";

import { useEffect, useState, useCallback } from "react";
import {
  adminLogin, adminFetchOrders, adminUpdateOrderStatus,
  adminFetchProducts, adminUpdateProduct, adminFetchUsers,
  adminCreateProduct, adminCreateVariant, adminUpdateVariant,
} from "@/services/api";
import { Order, Product } from "@/types/api";
import {
  Lock, LogOut, Package, Users, ShoppingBag, ChevronDown,
  ChevronUp, Loader2, Check, X, Plus, Edit2, Eye, EyeOff,
} from "lucide-react";

type Tab = "orders" | "products" | "users";

const ORDER_STATUSES = ["PENDING", "PAID", "PROCESSING", "DELIVERED", "CANCELLED", "REFUNDED"] as const;
const STATUS_LABELS: Record<string, string> = {
  PENDING: "در انتظار",
  PAID: "پرداخت شده",
  PROCESSING: "در پردازش",
  DELIVERED: "تحویل شده",
  CANCELLED: "لغو شده",
  REFUNDED: "برگشت وجه",
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10",
  PAID: "text-blue-400 border-blue-400/40 bg-blue-400/10",
  PROCESSING: "text-purple-400 border-purple-400/40 bg-purple-400/10",
  DELIVERED: "text-green-400 border-green-400/40 bg-green-400/10",
  CANCELLED: "text-red-400 border-red-400/40 bg-red-400/10",
  REFUNDED: "text-orange-400 border-orange-400/40 bg-orange-400/10",
};

// ─── Login ───────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { token } = await adminLogin(secret);
      localStorage.setItem("zoodsub_token", token);
      onLogin(token);
    } catch {
      setError("رمز ادمین نادرست است");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cyan-500/20 border border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            <span className="text-purple-400">زود</span>
            <span className="text-cyan-400">ساب</span>
            <span className="text-slate-400 text-base font-normal mr-2">/ ادمین</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">برای ورود رمز ادمین را وارد کنید</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showSecret ? "text" : "password"}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="ADMIN_SECRET"
              className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl py-4 px-4 pr-12 text-white text-left font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !secret.trim()}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
            ورود به پنل مدیریت
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Orders Tab ──────────────────────────────────────────────────────────────

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = useCallback(() => {
    void (async () => {
      setLoading(true);
      try {
        setOrders(await adminFetchOrders(filterStatus !== "all" ? filterStatus : undefined));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await adminUpdateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch {
      alert("خطا در بروزرسانی وضعیت");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setFilterStatus("all")}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
            filterStatus === "all" ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50" : "bg-slate-800 text-slate-400 border-slate-700"
          }`}
        >
          همه
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              filterStatus === s ? STATUS_COLORS[s] : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">سفارشی یافت نشد</div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    className="text-slate-400 hover:text-white mt-0.5"
                  >
                    {expandedId === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <div className="text-right flex-1">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status] || "text-slate-400 border-slate-600"}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                      <span className="font-mono text-xs text-cyan-400">{order.orderNumber}</span>
                    </div>
                    <p className="text-sm font-bold text-white">{order.fullName}</p>
                    <p className="text-xs text-slate-400">{order.phone} • {order.deliveryMethod}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
                  <span className="text-sm font-bold text-white">
                    {order.totalPrice.toLocaleString("fa-IR")}
                    <span className="text-xs font-normal text-slate-400 mr-1">ت</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                  </span>
                </div>
              </div>

              {/* Expanded: items + status changer */}
              {expandedId === order.id && (
                <div className="border-t border-slate-700/50 bg-slate-900/40 p-4 space-y-4">
                  {/* Items */}
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs">
                        <span className="text-cyan-400">{item.total.toLocaleString("fa-IR")} ت</span>
                        <span className="text-slate-300 text-right">{item.title} — {item.variantName} × {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  {/* Contact */}
                  <div className="text-xs text-right text-slate-400 space-y-1 bg-slate-800/60 rounded-xl p-3">
                    <div className="flex justify-between"><span className="text-slate-300">{order.email}</span><span>ایمیل</span></div>
                    {order.telegramUsername && <div className="flex justify-between"><span className="text-slate-300 font-mono">@{order.telegramUsername}</span><span>تلگرام</span></div>}
                    <div className="flex justify-between"><span className="text-slate-300">{order.country}</span><span>کشور</span></div>
                    {order.note && <div className="flex justify-between"><span className="text-slate-300">{order.note}</span><span>یادداشت</span></div>}
                  </div>
                  {/* Status changer */}
                  <div>
                    <p className="text-xs text-slate-400 text-right mb-2">تغییر وضعیت:</p>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {ORDER_STATUSES.map((s) => (
                        <button
                          key={s}
                          disabled={order.status === s || updatingId === order.id}
                          onClick={() => handleStatusChange(order.id, s)}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all disabled:opacity-40 ${
                            order.status === s
                              ? STATUS_COLORS[s] + " shadow-sm"
                              : "bg-slate-700 text-slate-400 border-slate-600 hover:bg-slate-600"
                          }`}
                        >
                          {updatingId === order.id ? "..." : STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────────────────

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = () => {
    void (async () => {
      setLoading(true);
      try {
        setProducts(await adminFetchProducts());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (product: Product) => {
    setTogglingId(product.id);
    try {
      await adminUpdateProduct(product.id, { isActive: !product.isActive });
      setProducts((prev) =>
        prev.map((p) => p.id === product.id ? { ...p, isActive: !p.isActive } : p)
      );
    } catch {
      alert("خطا در تغییر وضعیت");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-2 rounded-xl hover:bg-cyan-500/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> محصول جدید
        </button>
        <p className="text-xs text-slate-400">{products.length} محصول</p>
      </div>

      {showCreate && (
        <CreateProductForm onCreated={() => { setShowCreate(false); load(); }} />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleActive(product)}
                      disabled={togglingId === product.id}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all border ${
                        product.isActive
                          ? "bg-green-500/20 border-green-500/40 text-green-400"
                          : "bg-slate-700 border-slate-600 text-slate-500"
                      }`}
                    >
                      {togglingId === product.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : product.isActive ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                      className="text-slate-400 hover:text-white"
                    >
                      {expandedId === product.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="text-right flex-1">
                    <div className="flex items-center gap-2 justify-end">
                      {product.isFeatured && (
                        <span className="text-[9px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-1.5 py-0.5 rounded-full">ویژه</span>
                      )}
                      {!product.isActive && (
                        <span className="text-[9px] text-red-400 bg-red-400/10 border border-red-400/30 px-1.5 py-0.5 rounded-full">غیرفعال</span>
                      )}
                      <h3 className="text-sm font-bold text-white">{product.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{product.category.name} • {product.variants.length} پلن</p>
                  </div>
                </div>
              </div>

              {/* Expanded: variants */}
              {expandedId === product.id && (
                <div className="border-t border-slate-700/50 bg-slate-900/40 p-4 space-y-3">
                  <p className="text-xs text-slate-400 text-right font-bold">پلن‌ها:</p>
                  {product.variants.map((v) => (
                    <div key={v.id} className="flex items-center justify-between bg-slate-800/60 rounded-xl px-3 py-2.5 border border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${v.isActive ? "bg-green-400" : "bg-slate-600"}`} />
                        <VariantEditor variant={v} onUpdated={() => load()} />
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-white">{v.name}</p>
                        <p className="text-[10px] text-cyan-400">{v.price.toLocaleString("fa-IR")} ت</p>
                        {v.stock !== -1 && (
                          <p className="text-[10px] text-slate-500">موجودی: {v.stock}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <AddVariantForm productId={product.id} onAdded={() => load()} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VariantEditor({ variant, onUpdated }: { variant: { id: number; price: number; stock: number; isActive: boolean; name: string }; onUpdated: () => void }) {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(String(variant.price));
  const [stock, setStock] = useState(String(variant.stock));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await adminUpdateVariant(variant.id, {
        price: parseInt(price),
        stock: parseInt(stock),
      });
      onUpdated();
      setEditing(false);
    } catch {
      alert("خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="text-slate-500 hover:text-cyan-400 transition-colors">
        <Edit2 className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={save} disabled={saving} className="text-green-400 hover:text-green-300">
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
      </button>
      <button onClick={() => setEditing(false)} className="text-slate-400">
        <X className="w-3.5 h-3.5" />
      </button>
      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="w-16 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-xs text-white text-center"
        placeholder="stock"
      />
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-24 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-xs text-white text-center"
        placeholder="قیمت"
      />
    </div>
  );
}

function AddVariantForm({ productId, onAdded }: { productId: number; onAdded: () => void }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", duration: "", region: "", price: "", stock: "-1" });
  const [saving, setSaving] = useState(false);

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="text-xs text-slate-500 hover:text-cyan-400 flex items-center gap-1 transition-colors"
      >
        <Plus className="w-3 h-3" /> افزودن پلن
      </button>
    );
  }

  const save = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      await adminCreateVariant({ productId, ...form, price: parseInt(form.price), stock: parseInt(form.stock) });
      onAdded();
      setShow(false);
      setForm({ name: "", duration: "", region: "", price: "", stock: "-1" });
    } catch {
      alert("خطا در افزودن پلن");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full bg-slate-800/80 border border-slate-600 rounded-xl px-3 py-2 text-xs text-white text-right placeholder:text-slate-500 focus:outline-none focus:border-cyan-500";

  return (
    <div className="space-y-2 bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
      <p className="text-[10px] text-slate-400 text-right font-bold">پلن جدید</p>
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="نام پلن *" className={inputCls} />
      <div className="grid grid-cols-2 gap-2">
        <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="مدت (1 Month)" className={inputCls} />
        <input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="ریجن (Turkey)" className={inputCls} />
        <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="قیمت (تومان) *" className={inputCls} />
        <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="موجودی (-1=نامحدود)" className={inputCls} />
      </div>
      <div className="flex gap-2">
        <button onClick={() => setShow(false)} className="flex-1 text-xs text-slate-400 bg-slate-700 rounded-xl py-2 hover:bg-slate-600 transition-all">لغو</button>
        <button onClick={save} disabled={saving} className="flex-1 text-xs text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl py-2 transition-all flex items-center justify-center gap-1">
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} افزودن
        </button>
      </div>
    </div>
  );
}

function CreateProductForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({
    title: "", slug: "", description: "", categoryId: "",
    deliveryType: "instant", isActive: true, isFeatured: false,
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.title || !form.slug || !form.categoryId) { alert("نام، اسلاگ و دسته‌بندی اجباری است"); return; }
    setSaving(true);
    try {
      await adminCreateProduct({ ...form, categoryId: parseInt(form.categoryId) });
      onCreated();
    } catch {
      alert("خطا در ایجاد محصول");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-3 text-sm text-white text-right placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-all";

  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-4 space-y-3">
      <h3 className="text-sm font-bold text-cyan-400 text-right">محصول جدید</h3>
      <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="نام محصول *" className={inputCls} />
      <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} placeholder="اسلاگ (spotify-premium) *" className={`${inputCls} text-left font-mono`} dir="ltr" />
      <input value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} type="number" placeholder="شناسه دسته‌بندی (ID) *" className={inputCls} />
      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="توضیحات (اختیاری)" rows={2} className={`${inputCls} resize-none`} />
      <div className="flex gap-4 text-sm justify-end">
        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="accent-cyan-500" />
          محصول ویژه
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-cyan-500" />
          فعال
        </label>
      </div>
      <div className="flex gap-2">
        <button onClick={onCreated} className="flex-1 text-sm text-slate-400 bg-slate-700 rounded-xl py-3 hover:bg-slate-600 transition-all">لغو</button>
        <button onClick={save} disabled={saving} className="flex-1 text-sm text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl py-3 transition-all flex items-center justify-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} ایجاد
        </button>
      </div>
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

interface AdminUser {
  id: number;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  isAdmin: boolean;
  createdAt: string;
}

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const data = await adminFetchUsers(debouncedSearch || undefined);
        if (!cancelled) setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجوی کاربر (نام، یوزرنیم، شناسه)..."
          className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl py-3 px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-all text-right"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">کاربری یافت نشد</div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => {
            const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || "ناشناس";
            return (
              <div key={u.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {u.isAdmin && (
                    <span className="text-[9px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-1.5 py-0.5 rounded-full">ادمین</span>
                  )}
                  <span className="font-mono text-[10px] text-slate-500">{u.telegramId}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{name}</p>
                  {u.username && (
                    <p className="text-[10px] text-slate-400 font-mono">@{u.username}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("orders");

  useEffect(() => {
    const restoreToken = () => {
      const stored = typeof window !== "undefined" ? localStorage.getItem("zoodsub_token") : null;
      if (stored) setToken(stored);
    };
    restoreToken();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("zoodsub_token");
    setToken(null);
  };

  if (!token) {
    return <LoginScreen onLogin={setToken} />;
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "orders", label: "سفارشات", icon: <ShoppingBag className="w-4 h-4" /> },
    { id: "products", label: "محصولات", icon: <Package className="w-4 h-4" /> },
    { id: "users", label: "کاربران", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 pb-8">
      {/* Admin header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/60">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1.5 text-xs"
          >
            <LogOut className="w-4 h-4" /> خروج
          </button>
          <h1 className="text-lg font-extrabold">
            <span className="text-purple-400">زود</span>
            <span className="text-cyan-400">ساب</span>
            <span className="text-slate-500 text-sm font-normal mr-1.5">/ پنل مدیریت</span>
          </h1>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="flex gap-1 bg-slate-800/60 border border-slate-700 rounded-2xl p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  tab === t.id
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5">
        {tab === "orders" && <OrdersTab />}
        {tab === "products" && <ProductsTab />}
        {tab === "users" && <UsersTab />}
      </main>
    </div>
  );
}

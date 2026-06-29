"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { User, LogOut, ChevronLeft, ShoppingBag, Crown, Shield } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { user, clearAuth } = useUserStore();

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.BackButton.show();
      tg.BackButton.onClick(() => router.back());
      return () => tg.BackButton.hide();
    }
  }, [router]);

  const handleLogout = () => {
    clearAuth();
    router.push("/");
  };

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "کاربر زودساب"
    : "کاربر زودساب";

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 pb-36">
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/60">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">پروفایل</h1>
          <button
            onClick={() => router.back()}
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            بازگشت
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative">
            {user?.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoUrl}
                alt={displayName}
                className="w-24 h-24 rounded-full border-2 border-cyan-500 shadow-lg shadow-cyan-500/20 object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-slate-800 rounded-full border-2 border-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <User className="w-12 h-12 text-cyan-400" />
              </div>
            )}
            {user?.isAdmin && (
              <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-slate-900 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow">
                <Crown className="w-2.5 h-2.5" /> ادمین
              </div>
            )}
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold text-white">{displayName}</h2>
            {user?.username && (
              <p className="text-sm text-slate-400 font-mono mt-0.5">@{user.username}</p>
            )}
            {!user && (
              <p className="text-sm text-slate-500 mt-1">وارد نشده‌اید</p>
            )}
          </div>
        </div>

        {/* Info cards */}
        {user && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl divide-y divide-slate-700/60">
            {user.username && (
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-sm text-slate-300 font-mono">@{user.username}</span>
                <span className="text-xs text-slate-500">یوزرنیم تلگرام</span>
              </div>
            )}
            {user.isAdmin && (
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-2 py-1 rounded-full flex items-center gap-1">
                  <Shield className="w-3 h-3" /> دسترسی ادمین
                </span>
                <span className="text-xs text-slate-500">نقش کاربری</span>
              </div>
            )}
          </div>
        )}

        {/* Quick links */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl divide-y divide-slate-700/60">
          <Link
            href="/orders"
            className="flex justify-between items-center px-4 py-4 hover:bg-slate-800/60 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500 rotate-180" />
            <div className="flex items-center gap-3">
              <span className="text-sm text-white">سفارشات من</span>
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
            </div>
          </Link>
          {user?.isAdmin && (
            <Link
              href="/admin"
              className="flex justify-between items-center px-4 py-4 hover:bg-slate-800/60 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500 rotate-180" />
              <div className="flex items-center gap-3">
                <span className="text-sm text-white">پنل مدیریت</span>
                <Crown className="w-5 h-5 text-yellow-400" />
              </div>
            </Link>
          )}
        </div>

        {/* Logout */}
        {user && (
          <button
            onClick={handleLogout}
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 flex items-center justify-center gap-2 py-4 rounded-2xl transition-all font-bold text-sm active:scale-95"
          >
            <LogOut className="w-5 h-5" /> خروج از حساب
          </button>
        )}
      </main>
    </div>
  );
}

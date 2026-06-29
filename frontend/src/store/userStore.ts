"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserProfile } from "../types/api";

interface UserStore {
  user: UserProfile | null;
  token: string | null;
  setAuth: (user: UserProfile, token: string) => void;
  clearAuth: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem("zoodsub_token", token);
        set({ user, token });
      },
      clearAuth: () => {
        localStorage.removeItem("zoodsub_token");
        set({ user: null, token: null });
      },
    }),
    { name: "zoodsub_user" }
  )
);

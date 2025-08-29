/* -------------------------------------------------------------------------
   src/stores/user-store.ts          (atualizado com incomingStats e globalConfig)
   ------------------------------------------------------------------------- */
"use client";

import { create } from "zustand";
import { useEffect } from "react";

/* ------------------------------------------------------------------ */
/* 1. Tipos vindos da rota `/api/user/profile`                        */
/* ------------------------------------------------------------------ */
export type UserProfile = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  type: string | null;
  taxId: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  canGeneratePix: boolean;
  canWithdraw: boolean;
  kycApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UserSettings = {
  preferredTheme: string | null;
  preferredLanguage: string | null;
  timezone: string | null;
  notificationEmail: boolean;
  notificationPush: boolean;
  minPixWithdrawal: number | null;
  minCryptoWithdrawal: number | null;
  minPixWithdrawalTax: number | null;
  minCryptoWithdrawalTax: number | null;
  dailyWithdrawalLimit: number | null;
  pixAcquirerId: string | null;
  creditAcquirerId: string | null;
  cryptoAcquirerId: string | null;
  pixFeePercent: number | null;
  pixFeeFixed: number | null;
  creditFeePercent: number | null;
  creditFeeFixed: number | null;
  reservePercent: number | null;
  reserveFixed: number | null;
  customLogoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UserBalance = {
  updatedAt: Date | null;
  currency: string;
  current: number;
  pending: number;
  blocked: number;
};

export type ConversionRates = {
  general: number;
  pix: number;
  creditCard: number;
  boleto: number;
  chargebackRate: number;
};

// NOVO: Tipo para estatísticas de transações INCOMING
export type IncomingStats = {
  totalIncomingCompleted: number;
  totalIncomingAmount: number;      // Faturamento total histórico
  todayIncomingAmount: number;      // Recebido hoje
};

// NOVO: Tipo para configurações globais do sistema
export type GlobalConfig = {
  contactEmail: string | null;
  whatsappNumber: string | null;
  whatsappGroupLink: string | null;
  siteName: string | null;
  siteUrl: string | null;
  siteLogoUrl: string | null;
  faviconUrl: string | null;
  seoDefaultTitle: string | null;
  seoDefaultDescription: string | null;
  seoDefaultKeywords: string | null;
};

export type UserData = {
  user: UserProfile;
  settings: UserSettings | null;
  balance: UserBalance;
  conversionRates: ConversionRates;
  incomingStats: IncomingStats; // <-- NOVO CAMPO
  globalConfig: GlobalConfig | null; // <-- NOVO CAMPO
};

export type UserStore = {
  data: UserData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  fetchProfile: () => Promise<void>;
};

/* ------------------------------------------------------------------ */
/* 2. Config de polling                                               */
/* ------------------------------------------------------------------ */
const POLL_VISIBLE = 30_000;  // 30 s com aba visível
const POLL_HIDDEN  = 120_000; // 2 min com aba oculta

/* ------------------------------------------------------------------ */
/* 3. Zustand store                                                   */
/* ------------------------------------------------------------------ */
export const useUserStore = create<UserStore>((set) => ({
  data: null,
  loading: false,
  error: null,
  lastUpdated: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/user/profile");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = (await res.json()) as UserData;

      set({
        data: payload,
        lastUpdated: Date.now(),
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err?.message ?? "Falha ao buscar perfil",
        loading: false,
      });
    }
  },
}));

/* ------------------------------------------------------------------ */
/* 4. Componente de polling global (monte no RootLayout)              */
/* ------------------------------------------------------------------ */
export function UserPolling() {
  const fetchProfile = useUserStore((s) => s.fetchProfile);

  useEffect(() => {
    // primeira carga
    fetchProfile();

    let id: NodeJS.Timeout;

    const startPolling = () => {
      clearInterval(id);
      const delay =
        document.visibilityState === "visible" ? POLL_VISIBLE : POLL_HIDDEN;
      id = setInterval(() => {
        if (document.visibilityState === "visible") fetchProfile();
      }, delay);
    };

    const handleVisibility = () => {
      startPolling();
      if (document.visibilityState === "visible") fetchProfile();
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchProfile]);

  return null; // não renderiza nada
}

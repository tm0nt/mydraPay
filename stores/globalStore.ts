// stores/globalStore.ts
import { create } from "zustand";

// Tipos baseados no schema
interface GlobalConfig {
  siteName: string;
  siteUrl: string;
  siteLogoUrl?: string;
  faviconUrl?: string;
  seoDefaultTitle?: string;
  seoDefaultDescription?: string;
  seoDefaultKeywords?: string;
  // Outros campos de GlobalConfig
}

interface UserSettings {
  preferredTheme?: string;
  preferredLanguage?: string;
  timezone?: string;
  notificationEmail?: boolean;
  notificationPush?: boolean;
  customSeoTitle?: string;
  customSeoDescription?: string;
  customSeoKeywords?: string;
  customLogoUrl?: string;
  // Outros campos
}

interface Notification {
  id: string;
  title: string;
  description?: string;
  type: string;
  priority: string;
  isRead: boolean;
  url?: string;
  createdAt: string;
}

interface OverviewData {
  id: string;
  name: string;
  email: string;
  balance: number;
  revenueToday: number;
  blockedAmount: number;
  totalRevenue: number;
  globalConfig: GlobalConfig;
  userSettings: UserSettings;
  notifications: Notification[];
  // Adicione mais campos do overview conforme necessário (ex.: products, checkouts)
}

interface GlobalState {
  data: OverviewData | null;
  loading: boolean;
  error: string | null;
  fetchOverview: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => void; // Exemplo de ação
}

export const useGlobalStore = create<GlobalState>((set) => ({
  data: null,
  loading: false,
  error: null,
  fetchOverview: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/overview");
      if (!response.ok) throw new Error("Falha ao carregar dados");
      const result = await response.json();
      set({ data: result, loading: false });
    } catch (err) {
      set({ error: (err as Error).message || "Erro ao carregar dados", loading: false });
    }
  },
  markNotificationAsRead: (notificationId) => {
    set((state) => {
      if (!state.data) return state;
      const updatedNotifications = state.data.notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      return { data: { ...state.data, notifications: updatedNotifications } };
    });
  },
}));

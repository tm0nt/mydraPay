import { create } from "zustand"

interface DashboardSummary {
  transactions: {
    current: number
    previous: number
    growth: number
  }
  revenue: {
    current: number
    previous: number
    growth: number
  }
  customers: {
    current: number
    previous: number
    growth: number
  }
  withdrawals: {
    current: number
    previous: number
    growth: number
  }
  balance: {
    current: number
    pending: number
    blocked: number
  }
}

interface RecentTransaction {
  id: string
  amount: number
  status: string
  createdAt: string
  customer?: {
    name: string
    email?: string
  }
}

interface AnalyticsState {
  summary: DashboardSummary | null
  recentTransactions: RecentTransaction[]
  loading: boolean
  error: string | null
  period: {
    start: Date
    end: Date
  } | null

  // Actions
  fetchDashboard: () => Promise<void>
  fetchAnalytics: (params?: {
    startDate?: string
    endDate?: string
    type?: string
  }) => Promise<any>
  clearError: () => void
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  summary: null,
  recentTransactions: [],
  loading: false,
  error: null,
  period: null,

  fetchDashboard: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch("/api/analytics/dashboard")
      if (!response.ok) throw new Error("Falha ao carregar dashboard")

      const result = await response.json()
      set({
        summary: result.summary,
        recentTransactions: result.recentTransactions,
        period: {
          start: new Date(result.period.start),
          end: new Date(result.period.end),
        },
        loading: false,
      })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  fetchAnalytics: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const searchParams = new URLSearchParams()
      if (params.startDate) searchParams.set("startDate", params.startDate)
      if (params.endDate) searchParams.set("endDate", params.endDate)
      if (params.type) searchParams.set("type", params.type)

      const response = await fetch(`/api/analytics?${searchParams}`)
      if (!response.ok) throw new Error("Falha ao carregar analytics")

      const result = await response.json()
      set({ loading: false })
      return result
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))

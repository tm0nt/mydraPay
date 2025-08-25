import { create } from "zustand"

interface Transaction {
  id: string
  amount: number
  currency: string
  type: "INCOMING" | "OUTGOING"
  method: "PIX" | "CREDIT_CARD" | "CRYPTO" | "BOLETO" | "OTHER"
  status: string
  description?: string
  externalRef?: string
  feeAmount?: number
  createdAt: string
  updatedAt: string
  customer?: {
    id: string
    name: string
    email?: string
  }
  acquirer?: {
    id: string
    name: string
    role: string
  }
  splits?: any[]
  metadata?: Record<string, any>
}

interface TransactionsState {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  stats: {
    totalAmount: number
    totalFees: number
    totalTransactions: number
  }

  // Actions
  fetchTransactions: (params?: {
    page?: number
    limit?: number
    status?: string
    type?: string
    method?: string
    startDate?: string
    endDate?: string
  }) => Promise<void>
  createTransaction: (data: {
    amount: number
    currency?: string
    type: "INCOMING" | "OUTGOING"
    method: "PIX" | "CREDIT_CARD" | "CRYPTO" | "BOLETO" | "OTHER"
    description?: string
    customerId?: string
    acquirerId?: string
    externalRef?: string
    metadata?: Record<string, any>
  }) => Promise<Transaction>
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<Transaction>
  clearError: () => void
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  stats: {
    totalAmount: 0,
    totalFees: 0,
    totalTransactions: 0,
  },

  fetchTransactions: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const searchParams = new URLSearchParams()
      if (params.page) searchParams.set("page", params.page.toString())
      if (params.limit) searchParams.set("limit", params.limit.toString())
      if (params.status) searchParams.set("status", params.status)
      if (params.type) searchParams.set("type", params.type)
      if (params.method) searchParams.set("method", params.method)
      if (params.startDate) searchParams.set("startDate", params.startDate)
      if (params.endDate) searchParams.set("endDate", params.endDate)

      const response = await fetch(`/api/transactions?${searchParams}`)
      if (!response.ok) throw new Error("Falha ao carregar transações")

      const result = await response.json()
      set({
        transactions: result.transactions,
        pagination: result.pagination,
        stats: result.stats,
        loading: false,
      })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  createTransaction: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao criar transação")
      }

      const newTransaction = await response.json()
      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
        loading: false,
      }))

      return newTransaction
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
      throw err
    }
  },

  updateTransaction: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao atualizar transação")
      }

      const updatedTransaction = await response.json()
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === id ? updatedTransaction : t)),
        loading: false,
      }))

      return updatedTransaction
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))

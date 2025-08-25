import { create } from "zustand"

interface Customer {
  id: string
  name: string
  taxId?: string
  email?: string
  phone?: string
  product?: string
  amount: number
  payment: "PIX" | "CREDIT_CARD" | "CRYPTO" | "BOLETO" | "OTHER"
  address?: Record<string, any>
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
  transactions: Array<{
    id: string
    amount: number
    status: string
    createdAt: string
  }>
  meds?: Array<{
    id: string
    amount: number
    status: string
    createdAt: string
  }>
}

interface CustomersState {
  customers: Customer[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  stats: {
    totalCustomers: number
    totalAmount: number
  }

  // Actions
  fetchCustomers: (params?: {
    page?: number
    limit?: number
    search?: string
    payment?: string
    startDate?: string
    endDate?: string
  }) => Promise<void>
  createCustomer: (data: {
    name: string
    taxId?: string
    email?: string
    phone?: string
    product?: string
    amount: number
    payment: "PIX" | "CREDIT_CARD" | "CRYPTO" | "BOLETO" | "OTHER"
    address?: Record<string, any>
    metadata?: Record<string, any>
  }) => Promise<Customer>
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<Customer>
  deleteCustomer: (id: string) => Promise<void>
  clearError: () => void
}

export const useCustomersStore = create<CustomersState>((set, get) => ({
  customers: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  stats: {
    totalCustomers: 0,
    totalAmount: 0,
  },

  fetchCustomers: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const searchParams = new URLSearchParams()
      if (params.page) searchParams.set("page", params.page.toString())
      if (params.limit) searchParams.set("limit", params.limit.toString())
      if (params.search) searchParams.set("search", params.search)
      if (params.payment) searchParams.set("payment", params.payment)
      if (params.startDate) searchParams.set("startDate", params.startDate)
      if (params.endDate) searchParams.set("endDate", params.endDate)

      const response = await fetch(`/api/customers?${searchParams}`)
      if (!response.ok) throw new Error("Falha ao carregar clientes")

      const result = await response.json()
      set({
        customers: result.customers,
        pagination: result.pagination,
        stats: result.stats,
        loading: false,
      })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  createCustomer: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao criar cliente")
      }

      const newCustomer = await response.json()
      set((state) => ({
        customers: [newCustomer, ...state.customers],
        loading: false,
      }))

      return newCustomer
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
      throw err
    }
  },

  updateCustomer: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao atualizar cliente")
      }

      const updatedCustomer = await response.json()
      set((state) => ({
        customers: state.customers.map((c) => (c.id === id ? updatedCustomer : c)),
        loading: false,
      }))

      return updatedCustomer
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
      throw err
    }
  },

  deleteCustomer: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao deletar cliente")
      }

      set((state) => ({
        customers: state.customers.filter((c) => c.id !== id),
        loading: false,
      }))
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))

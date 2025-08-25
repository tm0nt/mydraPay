import { create } from "zustand"

interface Product {
  id: string
  name: string
  description?: string
  sku?: string
  basePrice?: number
  currency: string
  images: string[]
  tags: string[]
  active: boolean
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
  checkouts: Array<{
    id: string
    name: string
    slug: string
    status: string
  }>
  _count: {
    checkouts: number
  }
}

interface ProductsState {
  products: Product[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }

  // Actions
  fetchProducts: (params?: {
    page?: number
    limit?: number
    search?: string
    active?: boolean
    tag?: string
  }) => Promise<void>
  createProduct: (data: {
    name: string
    description?: string
    sku?: string
    basePrice?: number
    currency?: string
    images?: string[]
    tags?: string[]
    active?: boolean
    metadata?: Record<string, any>
  }) => Promise<Product>
  updateProduct: (id: string, data: Partial<Product>) => Promise<Product>
  deleteProduct: (id: string) => Promise<void>
  clearError: () => void
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },

  fetchProducts: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const searchParams = new URLSearchParams()
      if (params.page) searchParams.set("page", params.page.toString())
      if (params.limit) searchParams.set("limit", params.limit.toString())
      if (params.search) searchParams.set("search", params.search)
      if (params.active !== undefined) searchParams.set("active", params.active.toString())
      if (params.tag) searchParams.set("tag", params.tag)

      const response = await fetch(`/api/products?${searchParams}`)
      if (!response.ok) throw new Error("Falha ao carregar produtos")

      const result = await response.json()
      set({
        products: result.products,
        pagination: result.pagination,
        loading: false,
      })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  createProduct: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao criar produto")
      }

      const newProduct = await response.json()
      set((state) => ({
        products: [newProduct, ...state.products],
        loading: false,
      }))

      return newProduct
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
      throw err
    }
  },

  updateProduct: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao atualizar produto")
      }

      const updatedProduct = await response.json()
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updatedProduct : p)),
        loading: false,
      }))

      return updatedProduct
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
      throw err
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao deletar produto")
      }

      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        loading: false,
      }))
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))

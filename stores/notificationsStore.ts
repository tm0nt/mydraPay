import { create } from "zustand"

interface Notification {
  id: string
  title: string
  description?: string
  type: "INFO" | "WARNING" | "ERROR" | "SUCCESS" | "SYSTEM"
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  isRead: boolean
  url?: string
  metadata?: Record<string, any>
  createdAt: string
}

interface NotificationsState {
  notifications: Notification[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  unreadCount: number

  // Actions
  fetchNotifications: (params?: {
    page?: number
    limit?: number
    isRead?: boolean
    type?: string
    priority?: string
  }) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  createNotification: (data: {
    title: string
    description?: string
    type?: "INFO" | "WARNING" | "ERROR" | "SUCCESS" | "SYSTEM"
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    url?: string
    metadata?: Record<string, any>
  }) => Promise<Notification>
  clearError: () => void
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  unreadCount: 0,

  fetchNotifications: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const searchParams = new URLSearchParams()
      if (params.page) searchParams.set("page", params.page.toString())
      if (params.limit) searchParams.set("limit", params.limit.toString())
      if (params.isRead !== undefined) searchParams.set("isRead", params.isRead.toString())
      if (params.type) searchParams.set("type", params.type)
      if (params.priority) searchParams.set("priority", params.priority)

      const response = await fetch(`/api/notifications?${searchParams}`)
      if (!response.ok) throw new Error("Falha ao carregar notificações")

      const result = await response.json()
      set({
        notifications: result.notifications,
        pagination: result.pagination,
        unreadCount: result.unreadCount,
        loading: false,
      })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Falha ao marcar como lida")

      set((state) => ({
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
      })

      if (!response.ok) throw new Error("Falha ao marcar todas como lidas")

      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }))
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  createNotification: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao criar notificação")
      }

      const newNotification = await response.json()
      set((state) => ({
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
        loading: false,
      }))

      return newNotification
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))

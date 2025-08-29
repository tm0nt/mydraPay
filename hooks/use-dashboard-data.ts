"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { apiClient } from "@/lib/api-client"

interface DashboardStats {
  availableBalance: number
  todayRevenue: number
  blockedAmount: number
  totalRevenue: number
  pendingBalance: number
  averageTicket: number
  dailyAverage: number
  transactionCount: number
  conversionRates: {
    general: number
    pix: number
    creditCard: number
    boleto: number
    chargebackRate: number
  }
}

interface Transaction {
  id: string
  amount: number
  status: string
  paymentMethod: string
  createdAt: string
  customerName?: string
}

interface Notification {
  id: string
  title: string
  description: string
  type: "success" | "info" | "warning" | "error"
  createdAt: string
  read: boolean
}

type AnalyticsResponse = DashboardStats
type TransactionsResponse = { data: Transaction[] }
type NotificationsResponse = { data: Notification[] }

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(true)  // Novo: loading apenas inicial
  const [isRefreshing, setIsRefreshing] = useState(false)       // Novo: refetch em background
  const [error, setError] = useState<string | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const mountedRef = useRef(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isFirstFetch = useRef(true)  // Rastreia se é a primeira carga

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const fetchDashboardData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      if (!mountedRef.current) return

      // Define estados de loading/refresh com base se é inicial ou refetch
      if (isFirstFetch.current) {
        setIsInitialLoading(true)
        setError(null)
      } else {
        setIsRefreshing(true)  // Refetch: não esconde conteúdo, só indica atualização
      }

      const [analyticsRes, transactionsRes, notificationsRes] = await Promise.all([
        apiClient.get<AnalyticsResponse>("/api/analytics/dashboard", { signal: controller.signal }),
        apiClient.get<TransactionsResponse>("/api/transactions", {
          signal: controller.signal,
          params: { limit: 10, sortBy: "createdAt", sortOrder: "desc" },
        }),
        apiClient.get<NotificationsResponse>("/api/notifications", {
          signal: controller.signal,
          params: { limit: 10, unreadFirst: true },
        }),
      ])

      if (controller.signal.aborted || !mountedRef.current) return

      const analyticsData = (analyticsRes as any)?.data ?? analyticsRes
      const transactionsData = (transactionsRes as any)?.data ?? transactionsRes
      const notificationsData = (notificationsRes as any)?.data ?? notificationsRes

      const dashboardStats: DashboardStats = {
        availableBalance: analyticsData?.availableBalance ?? 0,
        todayRevenue: analyticsData?.todayRevenue ?? 0,
        blockedAmount: analyticsData?.blockedAmount ?? 0,
        totalRevenue: analyticsData?.totalRevenue ?? 0,
        pendingBalance: analyticsData?.pendingBalance ?? 0,
        averageTicket: analyticsData?.averageTicket ?? 0,
        dailyAverage: analyticsData?.dailyAverage ?? 0,
        transactionCount: analyticsData?.transactionCount ?? 0,
        conversionRates: {
          general: analyticsData?.conversionRates?.general ?? 0,
          pix: analyticsData?.conversionRates?.pix ?? 0,
          creditCard: analyticsData?.conversionRates?.creditCard ?? 0,
          boleto: analyticsData?.conversionRates?.boleto ?? 0,
          chargebackRate: analyticsData?.conversionRates?.chargebackRate ?? 0,
        },
      }

      // Atualiza estados (causa re-render apenas nos valores mudados)
      setStats(dashboardStats)
      setTransactions(Array.isArray(transactionsData?.data) ? transactionsData.data : (transactionsData ?? []))
      setNotifications(Array.isArray(notificationsData?.data) ? notificationsData.data : (notificationsData ?? []))

      isFirstFetch.current = false  // Marca como não-inicial após primeira carga
    } catch (err: any) {
      if (
        err?.name === "AbortError" ||
        err?.name === "CanceledError" ||
        err?.message?.includes("aborted") ||
        err?.code === "ERR_CANCELED"
      ) {
        console.log("[v0] Request cancelado - ignorando erro")
        return
      }

      console.error("[v0] Dashboard data fetch error:", err)
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados")
      }
    } finally {
      if (mountedRef.current) {
        setIsInitialLoading(false)
        setIsRefreshing(false)
      }
    }
  }, [])

  const refetch = useCallback(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const markNotificationAsRead = async (notificationId: string) => {
    const prev = notifications
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    try {
      await apiClient.put(`/api/notifications/${notificationId}/read`)
    } catch (err) {
      console.error("[v0] Mark notification as read error:", err)
      setNotifications(prev)
    }
  }

  const markAllNotificationsAsRead = async () => {
    const prev = notifications
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    try {
      await apiClient.put("/api/notifications/read-all")
    } catch (err) {
      console.error("[v0] Mark all notifications as read error:", err)
      setNotifications(prev)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    intervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        fetchDashboardData()
      }
    }, 5000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchDashboardData])

  return {
    stats,
    transactions,
    notifications,
    isInitialLoading,  // Use isso no UI para loading inicial
    isRefreshing,      // Use para indicador sutil de atualização
    error,
    refetch,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  }
}

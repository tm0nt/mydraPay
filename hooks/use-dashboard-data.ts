"use client"

import { useEffect, useRef, useState } from "react"
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchingRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const fetchDashboardData = async (signal?: AbortSignal) => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    try {
      setLoading(true)
      setError(null)

      const [analyticsRes, transactionsRes, notificationsRes] = await Promise.all([
        apiClient.get<AnalyticsResponse>("/api/analytics/dashboard", { signal }),
        apiClient.get<TransactionsResponse>("/api/transactions", {
          signal,
          params: { limit: 10, sortBy: "createdAt", sortOrder: "desc" },
        }),
        apiClient.get<NotificationsResponse>("/api/notifications", {
          signal,
          params: { limit: 10, unreadFirst: true },
        }),
      ])

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

      if (signal?.aborted || !mountedRef.current) return

      setStats(dashboardStats)
      setTransactions(
        Array.isArray(transactionsData?.data) ? transactionsData.data : (transactionsData ?? [])
      )
      setNotifications(
        Array.isArray(notificationsData?.data) ? notificationsData.data : (notificationsData ?? [])
      )
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.message === "canceled" || err?.code === "ERR_CANCELED") {
        // ignore aborted
        return
      }
      console.error("[v0] Dashboard data fetch error:", err)
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados")
      }
    } finally {
      fetchingRef.current = false
      if (mountedRef.current) setLoading(false)
    }
  }

  const refetch = () => {
    const controller = new AbortController()
    void fetchDashboardData(controller.signal)
    return () => controller.abort()
  }

  const markNotificationAsRead = async (notificationId: string) => {
    const prev = notifications
    setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, read: true } : n)))
    try {
      await apiClient.put(`/api/notifications/${notificationId}/read`)
    } catch (err) {
      console.error("[v0] Mark notification as read error:", err)
      // rollback
      setNotifications(prev)
    }
  }

  const markAllNotificationsAsRead = async () => {
    const prev = notifications
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    try {
      await apiClient.put("/api/notifications/read-all")
    } catch (err) {
      console.error("[v0] Mark all notifications as read error:", err)
      // rollback
      setNotifications(prev)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    void fetchDashboardData(controller.signal)

    const interval = setInterval(() => {
      if (!controller.signal.aborted) {
        const loopController = new AbortController()
        void fetchDashboardData(loopController.signal)
      }
    }, 30000)

    return () => {
      controller.abort()
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    stats,
    transactions,
    notifications,
    loading,
    error,
    refetch,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  }
}

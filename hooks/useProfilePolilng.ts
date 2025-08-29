"use client"

import { useEffect } from "react"
import { useProfileStore } from "@/stores/useProfileStore"

export function useProfilePolling(intervalMs = 30000) {
  const fetchOnce = useProfileStore((s) => s.fetchOnce)
  const startPolling = useProfileStore((s) => s.startPolling)
  const stopPolling = useProfileStore((s) => s.stopPolling)

  useEffect(() => {
    // primeiro fetch imediato
    fetchOnce().catch(() => {})
    // inicia loop
    startPolling(intervalMs)
    // cleanup
    return () => {
      stopPolling()
    }
  }, [fetchOnce, startPolling, stopPolling, intervalMs])
}

"use client"

import { useEffect } from "react"
import { useProfileStore } from "@/stores/useProfileStore"

export function useRevalidateOnFocus() {
  const fetchOnce = useProfileStore((s) => s.fetchOnce)

  useEffect(() => {
    const onFocus = () => fetchOnce({ force: true }).catch(() => {})
    const onOnline = () => fetchOnce({ force: true }).catch(() => {})

    window.addEventListener("focus", onFocus)
    window.addEventListener("online", onOnline)
    return () => {
      window.removeEventListener("focus", onFocus)
      window.removeEventListener("online", onOnline)
    }
  }, [fetchOnce])
}

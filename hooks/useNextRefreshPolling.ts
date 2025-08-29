"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function useNextRefreshPolling(ms = 30000) {
  const router = useRouter()

  useEffect(() => {
    const id = window.setInterval(() => {
      router.refresh()
    }, ms)
    return () => {
      clearInterval(id)
    }
  }, [router, ms])
}

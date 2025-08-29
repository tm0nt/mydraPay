"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/useProfileStore";

const POLL_VISIBLE = 30_000;  // 30 s
const POLL_HIDDEN  = 120_000; // 2 min

export function UserPolling() {
  const fetchProfile = useUserStore((s) => s.fetchProfile);

  useEffect(() => {
    // primeira carga
    fetchProfile();

    let id: NodeJS.Timeout;

    const start = () => {
      clearInterval(id);
      const delay = document.visibilityState === "visible" ? POLL_VISIBLE : POLL_HIDDEN;
      id = setInterval(() => {
        if (document.visibilityState === "visible") fetchProfile();
      }, delay);
    };

    const onVisibility = () => {
      start();
      if (document.visibilityState === "visible") fetchProfile();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchProfile]);

  return null; // não renderiza nada
}

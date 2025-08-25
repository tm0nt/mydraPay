"use client"; // Isso é client-side

import { createContext, useContext } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const UserContext = createContext<any>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  // Use SWR para buscar e atualizar automaticamente (polling a cada 30s)
  const { data: userData, error, mutate } = useSWR("/api/analytics/dashboard", fetcher, {
    refreshInterval: 30000, // Atualiza a cada 30 segundos (ajuste conforme necessidade)
    revalidateOnFocus: true, // Atualiza ao focar a janela
  });

  // Extraia dados relevantes do response da sua rota (ex.: balance do summary)
  const user = userData ? {
    nome: userData?.nome || "Usuário", // Ajuste conforme sua rota retornar
    email: userData?.email,
    saldo: userData?.summary?.balance?.current || 0,
    // Outros campos: adicione mais do response
  } : null;

  return (
    <UserContext.Provider value={{ user, error, mutate }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

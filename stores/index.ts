export { useGlobalStore } from "./globalStore"
export { useProductsStore } from "./productsStore"
export { useTransactionsStore } from "./transactionsStore"
export { useCustomersStore } from "./customersStore"
export { useAnalyticsStore } from "./analyticsStore"
export { useNotificationsStore } from "./notificationsStore"

// Tipos compartilhados
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface DateRangeParams {
  startDate?: string
  endDate?: string
}

export interface SearchParams {
  search?: string
}

// Hook personalizado para limpar erros de todos os stores
import { useProductsStore } from "./productsStore"
import { useTransactionsStore } from "./transactionsStore"
import { useCustomersStore } from "./customersStore"
import { useAnalyticsStore } from "./analyticsStore"
import { useNotificationsStore } from "./notificationsStore"

export const useClearAllErrors = () => {
  const clearProductsError = useProductsStore((state) => state.clearError)
  const clearTransactionsError = useTransactionsStore((state) => state.clearError)
  const clearCustomersError = useCustomersStore((state) => state.clearError)
  const clearAnalyticsError = useAnalyticsStore((state) => state.clearError)
  const clearNotificationsError = useNotificationsStore((state) => state.clearError)

  return () => {
    clearProductsError()
    clearTransactionsError()
    clearCustomersError()
    clearAnalyticsError()
    clearNotificationsError()
  }
}

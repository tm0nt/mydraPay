// lib/api-client.ts
// CLIENT-SAFE HTTP CLIENT (não usa auth(), funciona no browser)

type FetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
  }

  private getDefaultHeaders(extra?: Record<string, string>) {
    return {
      "Content-Type": "application/json",
      ...(extra ?? {}),
    }
  }

  private toURL(endpoint: string, params?: Record<string, any>) {
    const url = new URL(endpoint, this.baseUrl)
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      }
    }
    return url.toString()
  }

  async get<T>(endpoint: string, opts?: { params?: Record<string, any>, signal?: AbortSignal, headers?: Record<string,string> }): Promise<T> {
    const url = this.toURL(endpoint, opts?.params)
    const res = await fetch(url, {
      method: "GET",
      credentials: "include", // envia cookies de sessão
      headers: this.getDefaultHeaders(opts?.headers),
      signal: opts?.signal,
    })
    if (!res.ok) throw new Error(`API Error: ${res.status}`)
    return res.json()
  }

  async post<T>(endpoint: string, data?: any, options?: FetchOptions): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers: this.getDefaultHeaders(options?.headers),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
    if (!res.ok) throw new Error(`API Error: ${res.status}`)
    return res.json()
  }

  async put<T>(endpoint: string, data?: any, options?: FetchOptions): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      credentials: "include",
      headers: this.getDefaultHeaders(options?.headers),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
    if (!res.ok) throw new Error(`API Error: ${res.status}`)
    return res.json()
  }

  async delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      credentials: "include",
      headers: this.getDefaultHeaders(options?.headers),
      ...options,
    })
    if (!res.ok) throw new Error(`API Error: ${res.status}`)
    return res.json()
  }
}

export const apiClient = new ApiClient()

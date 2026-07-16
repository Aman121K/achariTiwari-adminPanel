export const API_URL = import.meta.env.VITE_API_URL || 'https://api-achar.phoneclubs.com/api'

const inFlightGets = new Map<string, Promise<unknown>>()

export async function apiRequest(path: string, options: RequestInit = {}) {
  const token = window.localStorage.getItem('adminToken')
  const isFormData = options.body instanceof FormData
  const method = String(options.method || 'GET').toUpperCase()
  const request = async () => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(body.error || body.message || 'Request failed')
    return body
  }

  // React Strict Mode intentionally remounts effects in development. Share only
  // identical pending GETs; mutations and later explicit refreshes always run.
  if (method !== 'GET') return request()
  const key = `${token || 'anonymous'}:${path}`
  const pending = inFlightGets.get(key)
  if (pending) return pending
  const promise = request().finally(() => inFlightGets.delete(key))
  inFlightGets.set(key, promise)
  return promise
}

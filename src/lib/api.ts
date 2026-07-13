export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

export async function apiRequest(path: string, options: RequestInit = {}) {
  const token = window.localStorage.getItem('adminToken')
  const isFormData = options.body instanceof FormData
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

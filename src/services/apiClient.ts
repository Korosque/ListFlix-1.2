export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/** Chamada à API própria. O e-mail da sessão identifica a lista do usuário. */
export async function apiRequest<T>(path: string, owner: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('x-user-email', owner)
  if (init.body !== undefined) headers.set('Content-Type', 'application/json')

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message || `Erro na API (${response.status}).`)
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T)
}

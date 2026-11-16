import { createContext, useContext, useState, type ReactNode } from 'react'

interface User {
  name: string
  email: string
}

interface AuthValue {
  user: User | null
  login: (email: string, password: string) => boolean
  signOut: () => void
}

const STORAGE_KEY = 'listflix-user'
const Context = createContext<AuthValue | null>(null)

function readStoredUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as User | null
  } catch {
    return null
  }
}

// Sessão demonstrativa: não há autenticação real.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser)

  const login = (email: string, password: string) => {
    const address = email.trim()
    if (!/^\S+@\S+\.\S+$/.test(address) || password.length < 4) return false
    const next = {
      email: address,
      name: address
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase()),
    }
    setUser(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return true
  }

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return <Context.Provider value={{ user, login, signOut }}>{children}</Context.Provider>
}

export function useAuth() {
  const value = useContext(Context)
  if (!value) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return value
}

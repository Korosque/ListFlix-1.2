import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { fetchCatalog } from '../services/catalog'
import type { Movie } from '../types/movie'

interface CatalogValue {
  movies: Movie[]
  loading: boolean
  error: string
  retry: () => void
  query: string
  setQuery: (value: string) => void
}

const Context = createContext<CatalogValue | null>(null)

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    fetchCatalog()
      .then((items) => alive && setMovies(items))
      .catch(
        () => alive && setError('Não conseguimos carregar o catálogo. Verifique sua conexão e tente novamente.'),
      )
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [attempt])

  const retry = () => setAttempt((n) => n + 1)

  return (
    <Context.Provider value={{ movies, loading, error, retry, query, setQuery }}>
      {children}
    </Context.Provider>
  )
}

export function useCatalog() {
  const value = useContext(Context)
  if (!value) throw new Error('useCatalog deve ser usado dentro de CatalogProvider')
  return value
}

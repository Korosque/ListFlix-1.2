import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useWatchlist } from '../context/WatchlistContext'
import { watchlistApi } from '../services/watchlist'
import type { Movie, Page } from '../types/movie'
import { errorMessage } from '../utils/movies'

const PAGE_SIZE = 12
const DEBOUNCE_MS = 350

/** Busca e paginação da "Minha lista" direto na API (MySQL). */
export function useWatchlistPage() {
  const owner = useAuth().user?.email
  const { revision } = useWatchlist()
  const [search, setSearch] = useState('')
  const [term, setTerm] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Page<Movie> | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)

  // Só consulta a API depois que o usuário para de digitar.
  useEffect(() => {
    const timer = setTimeout(() => {
      setTerm(search.trim())
      setPage(1)
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    if (!owner) return
    let alive = true
    setLoading(true)
    setError('')
    watchlistApi
      .listPage(owner, { page, limit: PAGE_SIZE, search: term })
      .then((result) => {
        if (!alive) return
        // Removeu o último item da última página: volta uma página.
        if (result.data.length === 0 && result.totalPages > 0) setPage(result.totalPages)
        else setData(result)
      })
      .catch((e) => alive && setError(errorMessage(e, 'Não foi possível carregar sua lista.')))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [owner, page, term, revision, attempt])

  return { data, loading, error, search, setSearch, page, setPage, retry: () => setAttempt((n) => n + 1) }
}

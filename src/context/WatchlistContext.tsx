import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { watchlistApi } from '../services/watchlist'
import type { Movie, MovieInput } from '../types/movie'
import { errorMessage, sameMovie } from '../utils/movies'
import { useAuth } from './AuthContext'

interface WatchlistValue {
  saved: Movie[]
  /** Muda a cada escrita; telas paginadas usam para recarregar. */
  revision: number
  actionError: string
  isSaved: (movie: Pick<Movie, 'id' | 'title'>) => boolean
  add: (movie: MovieInput) => Promise<void>
  update: (movie: Movie) => Promise<void>
  remove: (id: number) => Promise<void>
  toggle: (movie: Movie) => void
}

const Context = createContext<WatchlistValue | null>(null)

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const owner = useAuth().user?.email
  const [saved, setSaved] = useState<Movie[]>([])
  const [revision, setRevision] = useState(0)
  const [actionError, setActionError] = useState('')

  // Lista completa: usada pelo contador do menu e pelos botões "Quero assistir".
  useEffect(() => {
    setSaved([])
    if (!owner) return
    let alive = true
    watchlistApi
      .list(owner)
      .then((items) => alive && setSaved(items))
      .catch((error) => alive && setActionError(errorMessage(error, 'Não foi possível carregar sua lista.')))
    return () => {
      alive = false
    }
  }, [owner])

  const requireOwner = () => {
    if (!owner) throw new Error('Entre novamente para alterar sua lista.')
    return owner
  }

  const add = async (movie: MovieInput) => {
    const created = await watchlistApi.create(movie, requireOwner())
    setSaved((list) => [created, ...list])
    setRevision((n) => n + 1)
  }

  const update = async (movie: Movie) => {
    const updated = await watchlistApi.update(movie, requireOwner())
    setSaved((list) => list.map((item) => (item.id === updated.id ? updated : item)))
    setRevision((n) => n + 1)
  }

  const remove = async (id: number) => {
    await watchlistApi.remove(id, requireOwner())
    setSaved((list) => list.filter((item) => item.id !== id))
    setRevision((n) => n + 1)
  }

  const toggle = (movie: Movie) => {
    const existing = saved.find((item) => sameMovie(item, movie))
    const { id: _id, ...input } = movie
    setActionError('')
    const action = existing ? remove(existing.id) : add(input)
    action.catch((error) => setActionError(errorMessage(error, 'Não foi possível alterar sua lista.')))
  }

  const isSaved = (movie: Pick<Movie, 'id' | 'title'>) => saved.some((item) => sameMovie(item, movie))

  return (
    <Context.Provider value={{ saved, revision, actionError, isSaved, add, update, remove, toggle }}>
      {children}
    </Context.Provider>
  )
}

export function useWatchlist() {
  const value = useContext(Context)
  if (!value) throw new Error('useWatchlist deve ser usado dentro de WatchlistProvider')
  return value
}

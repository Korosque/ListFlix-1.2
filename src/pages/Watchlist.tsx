import { BookmarkPlus, Heart, Pencil, RotateCcw, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MovieForm } from '../components/MovieForm'
import { Pagination } from '../components/Pagination'
import { PosterCard } from '../components/PosterCard'
import { Loader, StateCard } from '../components/StateCard'
import { useWatchlist } from '../context/WatchlistContext'
import { useWatchlistPage } from '../hooks/useWatchlistPage'
import type { Movie, MovieInput } from '../types/movie'
import { errorMessage } from '../utils/movies'

export function Watchlist() {
  const { add, update, remove } = useWatchlist()
  const list = useWatchlistPage()
  const [editing, setEditing] = useState<Movie | null>(null)
  const [feedback, setFeedback] = useState('')

  async function save(movie: MovieInput) {
    if (editing) await update({ ...movie, id: editing.id })
    else await add(movie)
    setFeedback(editing ? 'Filme atualizado.' : 'Filme cadastrado na lista.')
    setEditing(null)
  }

  async function confirmRemove(id: number) {
    if (!window.confirm('Remover este filme da sua lista?')) return
    try {
      await remove(id)
      if (editing?.id === id) setEditing(null)
      setFeedback('Filme removido.')
    } catch (error) {
      setFeedback(errorMessage(error, 'Não foi possível remover o filme.'))
    }
  }

  function startEdit(movie: Movie) {
    setEditing(movie)
    setFeedback('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const { data } = list

  return (
    <div className="page-content inner-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            <Heart size={14} /> SUA PRÓXIMA MARATONA
          </span>
          <h1>
            Minha lista<span className="green-dot">.</span>
          </h1>
          <p>Os filmes que já têm lugar marcado na sua próxima sessão.</p>
        </div>
        {data && <span className="catalog-total">{data.total} {data.total === 1 ? 'FILME' : 'FILMES'}</span>}
      </div>

      <MovieForm
        key={editing?.id ?? 'new'}
        editing={editing}
        onSave={save}
        onCancel={() => setEditing(null)}
      />
      {feedback && (
        <p className="form-feedback" role="status">
          {feedback}
        </p>
      )}

      <div className="list-toolbar">
        <label className="list-search">
          <Search size={15} />
          <input
            type="search"
            maxLength={100}
            placeholder="Buscar na minha lista..."
            aria-label="Buscar na minha lista"
            value={list.search}
            onChange={(event) => list.setSearch(event.target.value)}
          />
        </label>
        {data && data.total > 0 && (
          <span className="filter-count">
            {data.total} {data.total === 1 ? 'resultado' : 'resultados'}
          </span>
        )}
      </div>

      {list.error ? (
        <StateCard error title="Sua lista está indisponível." text={list.error}>
          <button className="secondary-button" onClick={list.retry}>
            <RotateCcw size={15} /> Tentar novamente
          </button>
        </StateCard>
      ) : !data ? (
        <StateCard icon={<Loader />} title="Carregando sua lista" text="Consultando o servidor ListFlix..." />
      ) : data.data.length === 0 ? (
        list.search.trim() ? (
          <StateCard icon={<Search size={24} />} title="Nenhum filme encontrado" text="Tente outro título." />
        ) : (
          <StateCard icon={<BookmarkPlus size={24} />} title="Sua lista está vazia" text="Cadastre um filme acima ou explore o catálogo.">
            <Link className="primary-button" to="/catalogo">
              Explorar catálogo
            </Link>
          </StateCard>
        )
      ) : (
        <>
          <div className="movie-grid catalog-grid" aria-busy={list.loading}>
            {data.data.map((movie) => (
              <div className="watchlist-card" key={movie.id}>
                <PosterCard movie={movie} saved onToggle={() => void confirmRemove(movie.id)} />
                <button className="watch-edit" onClick={() => startEdit(movie)}>
                  <Pencil size={13} /> Editar
                </button>
              </div>
            ))}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={list.setPage} />
        </>
      )}
    </div>
  )
}

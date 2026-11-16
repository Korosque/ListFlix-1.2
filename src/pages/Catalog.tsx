import { Clapperboard, RotateCcw, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PosterCard } from '../components/PosterCard'
import { Loader, StateCard } from '../components/StateCard'
import { useCatalog } from '../context/CatalogContext'
import { useWatchlist } from '../context/WatchlistContext'
import { genres } from '../services/catalog'

const filters = ['Todos', ...genres]

export function Catalog() {
  const { movies, query, loading, error, retry } = useCatalog()
  const { isSaved, toggle } = useWatchlist()
  const [filter, setFilter] = useState('Todos')
  const filtered = useMemo(() => {
    const term = query.toLowerCase()
    return movies.filter(
      (movie) => movie.title.toLowerCase().includes(term) && (filter === 'Todos' || movie.genre === filter),
    )
  }, [movies, query, filter])

  return (
    <div className="page-content inner-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            <Clapperboard size={14} /> CURADORIA LISTFLIX
          </span>
          <h1>
            Catálogo de filmes<span className="green-dot">.</span>
          </h1>
          <p>Encontre seu próximo favorito. Cada história merece uma chance.</p>
        </div>
        <span className="catalog-total">{movies.length} FILMES</span>
      </div>

      <div className="filter-row">
        <div className="filter-tabs">
          {filters.map((item) => (
            <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>
              {item}
            </button>
          ))}
        </div>
        <span className="filter-count">{filtered.length} resultados</span>
      </div>

      {loading ? (
        <StateCard icon={<Loader />} title="Preparando a sessão" text="Buscando títulos para você..." />
      ) : error ? (
        <StateCard error title="O catálogo está descansando." text={error}>
          <button className="secondary-button" onClick={retry}>
            <RotateCcw size={15} /> Tentar novamente
          </button>
        </StateCard>
      ) : filtered.length ? (
        <div className="movie-grid catalog-grid">
          {filtered.map((movie) => (
            <PosterCard key={movie.id} movie={movie} saved={isSaved(movie)} onToggle={toggle} />
          ))}
        </div>
      ) : (
        <StateCard
          icon={<Search size={24} />}
          title="Nenhum filme encontrado"
          text="Tente outro título ou escolha um filtro diferente."
        />
      )}
    </div>
  )
}

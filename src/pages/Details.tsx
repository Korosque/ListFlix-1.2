import { ArrowLeft, BookmarkPlus, Check, Clapperboard, Play } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { StateCard } from '../components/StateCard'
import { useCatalog } from '../context/CatalogContext'
import { useWatchlist } from '../context/WatchlistContext'
import { featured } from '../data/featured'
import type { Movie } from '../types/movie'
import { MoviePoster } from '../components/MoviePoster'

export function Details() {
  const { id } = useParams()
  const location = useLocation()
  const { movies } = useCatalog()
  const { isSaved, toggle } = useWatchlist()
  const movie =
    (location.state as { movie?: Movie } | null)?.movie ||
    movies.find((item) => String(item.id) === id) ||
    (id === String(featured.id) ? featured : null)

  if (!movie) {
    return (
      <div className="page-content inner-page">
        <Link className="text-link" to="/catalogo">
          <ArrowLeft size={15} /> Voltar ao catálogo
        </Link>
        <StateCard
          icon={<Clapperboard size={24} />}
          title="Esse filme não está no catálogo."
          text="Volte à seleção para encontrar sua próxima história."
        >
          <Link className="primary-button" to="/catalogo">
            Ver catálogo
          </Link>
        </StateCard>
      </div>
    )
  }

  const saved = isSaved(movie)

  return (
    <div className="detail-page">
      <div className="detail-back">
        <Link to="/catalogo">
          <ArrowLeft size={15} /> VOLTAR AO CATÁLOGO
        </Link>
      </div>
      <div className="detail-layout">
        <div className="detail-poster-wrap">
          <MoviePoster
            className="detail-poster"
            src={movie.posterURL}
            title={movie.title}
            imdbId={movie.imdbId}
            loading="eager"
          />
          <span className="poster-stamp">
            <Clapperboard size={14} /> LISTFLIX PICK
          </span>
        </div>
        <div className="detail-copy">
          <span className="eyebrow">UMA HISTÓRIA PARA SUA PRÓXIMA SESSÃO</span>
          <h1>
            {movie.title}
            <span className="green-dot">.</span>
          </h1>
          <div className="detail-meta">
            <span>{movie.year || 'Clássico'}</span>
            <span>{movie.genre || 'Cinema'}</span>
          </div>
          <div className="detail-rule" />
          <h3>Sobre o filme</h3>
          <p>
            {movie.overview ||
              `Uma história para descobrir: ${movie.title} é mais uma escolha para compor sua próxima noite de cinema. Explore o catálogo ListFlix e salve seus favoritos.`}
          </p>
          <div className="detail-actions">
            <button
              className={`primary-button ${saved ? 'saved-button' : ''}`}
              onClick={() => toggle(movie)}
            >
              {saved ? <Check size={16} /> : <BookmarkPlus size={16} />}
              {saved ? 'Salvo na minha lista' : 'Quero assistir'}
            </button>
            <Link to="/catalogo" className="secondary-button">
              <Play size={15} /> Mais filmes
            </Link>
          </div>
          <span className="detail-footnote">UMA BOA HISTÓRIA MERECE SER LEMBRADA.</span>
        </div>
      </div>
    </div>
  )
}

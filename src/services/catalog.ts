import type { Movie } from '../types/movie'
import { imdbPoster } from '../utils/movies'

const sources = [
  { endpoint: 'animation', label: 'Animação' },
  { endpoint: 'action-adventure', label: 'Ação e aventura' },
  { endpoint: 'comedy', label: 'Comédia' },
  { endpoint: 'drama', label: 'Drama' },
  { endpoint: 'horror', label: 'Terror' },
  { endpoint: 'family', label: 'Família' },
]

export const genres = sources.map((source) => source.label)

interface GhibliFilm {
  title: string
  image: string
  description: string
  release_date: string
}

/** Id numérico estável a partir do título (as APIs públicas repetem ids). */
const stableId = (title: string) =>
  Array.from(title.toLocaleLowerCase('pt-BR')).reduce(
    (hash, char) => (hash * 31 + char.codePointAt(0)!) >>> 0,
    7,
  )

function hasUsablePoster(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url)
    return (
      protocol === 'https:' && !/(^|\.)example\.com$/i.test(hostname) && !/placeholder|no[-_]?image/i.test(url)
    )
  } catch {
    return false
  }
}

const isImdbId = (id?: string): id is string => Boolean(id && /^tt\d{7,}$/.test(id))

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Não foi possível carregar o catálogo agora.')
  return response.json() as Promise<T>
}

export async function fetchCatalog(): Promise<Movie[]> {
  const [ghibli, ...sampleLists] = await Promise.all([
    getJson<GhibliFilm[]>('https://ghibliapi.vercel.app/films'),
    ...sources.map(async ({ endpoint, label }) => {
      const movies = await getJson<Movie[]>(`https://api.sampleapis.com/movies/${endpoint}`)
      return movies
        .filter(
          (movie) =>
            movie.title &&
            (hasUsablePoster(movie.posterURL) || isImdbId(movie.imdbId)) &&
            !/^(test|sample|am updated)\b/i.test(movie.title),
        )
        .map((movie) => ({
          ...movie,
          id: stableId(movie.title),
          posterURL: hasUsablePoster(movie.posterURL) ? movie.posterURL : imdbPoster(movie.imdbId!),
          genre: label,
        }))
    }),
  ])

  const animation: Movie[] = ghibli
    .filter((film) => film.title && hasUsablePoster(film.image))
    .map((film) => ({
      id: stableId(film.title),
      title: film.title,
      posterURL: film.image,
      year: Number(film.release_date) || undefined,
      overview: film.description,
      genre: 'Animação',
    }))

  const unique = new Map<string, Movie>()
  for (const movie of [...animation, ...sampleLists.flat()]) {
    const key = movie.title.trim().toLocaleLowerCase('pt-BR')
    if (!unique.has(key)) unique.set(key, movie)
  }
  return [...unique.values()]
}

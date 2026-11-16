import type { Movie } from '../types/movie'

const normalize = (title: string) => title.trim().toLocaleLowerCase('pt-BR')

/** Dois filmes são o mesmo se têm o mesmo id ou o mesmo título. */
export const sameMovie = (a: Pick<Movie, 'id' | 'title'>, b: Pick<Movie, 'id' | 'title'>) =>
  a.id === b.id || normalize(a.title) === normalize(b.title)

export const imdbPoster = (imdbId: string) =>
  `https://images.metahub.space/poster/medium/${imdbId}/img`

export const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

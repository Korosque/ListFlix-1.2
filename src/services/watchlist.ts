import type { Movie, MovieInput, Page } from '../types/movie'
import { apiRequest } from './apiClient'

export interface PageParams {
  page: number
  limit: number
  search: string
}

export const watchlistApi = {
  list: (owner: string) => apiRequest<Movie[]>('/movies', owner),
  listPage: (owner: string, { page, limit, search }: PageParams) => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit), search })
    return apiRequest<Page<Movie>>(`/movies/paginated?${query}`, owner)
  },
  create: (movie: MovieInput, owner: string) =>
    apiRequest<Movie>('/movies', owner, { method: 'POST', body: JSON.stringify(movie) }),
  update: (movie: Movie, owner: string) =>
    apiRequest<Movie>(`/movies/${movie.id}`, owner, { method: 'PUT', body: JSON.stringify(movie) }),
  remove: (id: number, owner: string) => apiRequest<void>(`/movies/${id}`, owner, { method: 'DELETE' }),
}

/** Filme como a API o entrega ao frontend. */
export interface Movie {
  id: number
  title: string
  posterURL: string
  imdbId?: string
  year?: number
  overview?: string
  genre?: string
}

export type MovieInput = Omit<Movie, 'id'>

export interface Page<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

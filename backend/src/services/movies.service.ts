import * as repository from '../repositories/movies.repository.js'
import type { Movie, MovieInput, Page } from '../types/movie.js'

/** O Fastify usa `statusCode` para montar a resposta HTTP do erro. */
export class NotFoundError extends Error {
  statusCode = 404
  constructor() {
    super('Filme não encontrado.')
  }
}

function clean(movie: MovieInput): MovieInput {
  return {
    ...movie,
    title: movie.title.trim(),
    posterURL: movie.posterURL.trim(),
    ...(movie.genre !== undefined && { genre: movie.genre.trim() }),
    ...(movie.overview !== undefined && { overview: movie.overview.trim() }),
  }
}

export function list(owner: string): Promise<Movie[]> {
  return repository.findAll(owner)
}

export async function listPage(
  owner: string,
  page: number,
  limit: number,
  search: string,
): Promise<Page<Movie>> {
  const { movies, total } = await repository.findPage(owner, search.trim(), limit, (page - 1) * limit)
  return { data: movies, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function get(owner: string, id: number): Promise<Movie> {
  const movie = await repository.findById(owner, id)
  if (!movie) throw new NotFoundError()
  return movie
}

export async function create(owner: string, input: MovieInput): Promise<Movie> {
  const id = await repository.insert(owner, clean(input))
  return get(owner, id)
}

export async function update(owner: string, id: number, input: MovieInput): Promise<Movie> {
  await get(owner, id)
  await repository.update(owner, id, clean(input))
  return get(owner, id)
}

export async function remove(owner: string, id: number): Promise<void> {
  await get(owner, id)
  await repository.remove(owner, id)
}

import type { MovieInput } from '../types/movie.js'

// Todas as rotas exigem o e-mail da conta demonstrativa.
const headers = {
  type: 'object',
  properties: { 'x-user-email': { type: 'string', format: 'email', maxLength: 255 } },
  required: ['x-user-email'],
} as const

const params = {
  type: 'object',
  properties: { id: { type: 'integer', minimum: 1 } },
  required: ['id'],
} as const

const body = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 255, pattern: '\\S' },
    posterURL: { type: 'string', format: 'uri', pattern: '^https?://', maxLength: 1000 },
    imdbId: { type: 'string', maxLength: 20 },
    year: { type: 'integer', minimum: 1888, maximum: 2100 },
    genre: { type: 'string', maxLength: 50 },
    overview: { type: 'string', maxLength: 2000 },
  },
  required: ['title', 'posterURL'],
  additionalProperties: false, // o Fastify descarta campos extras (ex.: id)
} as const

const querystring = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
    search: { type: 'string', maxLength: 100, default: '' },
  },
  additionalProperties: false,
} as const

export const listSchema = { headers }
export const paginatedSchema = { headers, querystring }
export const byIdSchema = { headers, params }
export const createSchema = { headers, body }
export const updateSchema = { headers, params, body }

export interface OwnerHeaders {
  'x-user-email': string
}
export interface IdParams {
  id: number
}
export interface PageQuery {
  page: number
  limit: number
  search: string
}
export type MovieBody = MovieInput

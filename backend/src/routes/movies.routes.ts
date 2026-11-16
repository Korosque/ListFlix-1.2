import type { FastifyInstance } from 'fastify'
import * as controller from '../controllers/movies.controller.js'
import {
  byIdSchema,
  createSchema,
  listSchema,
  paginatedSchema,
  updateSchema,
  type IdParams,
  type MovieBody,
  type OwnerHeaders,
  type PageQuery,
} from '../schemas/movies.schema.js'

type Headers = { Headers: OwnerHeaders }

export async function movieRoutes(app: FastifyInstance) {
  app.get<Headers>('/', { schema: listSchema }, controller.list)
  app.get<Headers & { Querystring: PageQuery }>('/paginated', { schema: paginatedSchema }, controller.listPage)
  app.get<Headers & { Params: IdParams }>('/:id', { schema: byIdSchema }, controller.get)
  app.post<Headers & { Body: MovieBody }>('/', { schema: createSchema }, controller.create)
  app.put<Headers & { Params: IdParams; Body: MovieBody }>('/:id', { schema: updateSchema }, controller.update)
  app.delete<Headers & { Params: IdParams }>('/:id', { schema: byIdSchema }, controller.remove)
}

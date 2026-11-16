import type { FastifyReply, FastifyRequest } from 'fastify'
import type { IdParams, MovieBody, OwnerHeaders, PageQuery } from '../schemas/movies.schema.js'
import * as service from '../services/movies.service.js'

type Headers = { Headers: OwnerHeaders }

const ownerOf = (request: FastifyRequest<Headers>) =>
  request.headers['x-user-email'].trim().toLocaleLowerCase('pt-BR')

export const list = (request: FastifyRequest<Headers>) => service.list(ownerOf(request))

export const listPage = (request: FastifyRequest<Headers & { Querystring: PageQuery }>) => {
  const { page, limit, search } = request.query
  return service.listPage(ownerOf(request), page, limit, search)
}

export const get = (request: FastifyRequest<Headers & { Params: IdParams }>) =>
  service.get(ownerOf(request), request.params.id)

export async function create(
  request: FastifyRequest<Headers & { Body: MovieBody }>,
  reply: FastifyReply,
) {
  const movie = await service.create(ownerOf(request), request.body)
  return reply.code(201).send(movie)
}

export const update = (request: FastifyRequest<Headers & { Params: IdParams; Body: MovieBody }>) =>
  service.update(ownerOf(request), request.params.id, request.body)

export async function remove(
  request: FastifyRequest<Headers & { Params: IdParams }>,
  reply: FastifyReply,
) {
  await service.remove(ownerOf(request), request.params.id)
  return reply.code(204).send()
}

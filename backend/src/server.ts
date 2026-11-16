import cors from '@fastify/cors'
import Fastify from 'fastify'
import { env } from './config/env.js'
import { movieRoutes } from './routes/movies.routes.js'

const localOrigin = /^http:\/\/(?:localhost|127\.0\.0\.1|\[::1\]):\d+$/

const app = Fastify({ logger: true })

await app.register(cors, {
  origin: env.frontendOrigin ? [env.frontendOrigin, localOrigin] : localOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-user-email'],
})
app.get('/health', async () => ({ status: 'ok' }))
await app.register(movieRoutes, { prefix: '/movies' })

try {
  await app.listen({ port: env.port, host: '0.0.0.0' })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}

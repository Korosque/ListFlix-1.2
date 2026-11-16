import { readFileSync } from 'node:fs'
import mysql from 'mysql2/promise'
import { env } from '../config/env.js'

// Executa o schema.sql (cria o banco e a tabela, se ainda não existirem).
const { database: _database, ...serverConfig } = env.db
const connection = await mysql.createConnection({ ...serverConfig, multipleStatements: true })
await connection.query(readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'))
await connection.end()
console.log('Banco listflix pronto.')

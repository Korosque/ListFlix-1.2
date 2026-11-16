import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { pool } from '../database/connection.js'
import type { Movie, MovieInput } from '../types/movie.js'

interface MovieRow extends RowDataPacket {
  id: number
  title: string
  poster_url: string
  imdb_id: string | null
  year: number | null
  genre: string | null
  overview: string | null
}

const COLUMNS = 'id, title, poster_url, imdb_id, year, genre, overview'

function toMovie(row: MovieRow): Movie {
  return {
    id: row.id,
    title: row.title,
    posterURL: row.poster_url,
    ...(row.imdb_id !== null && { imdbId: row.imdb_id }),
    ...(row.year !== null && { year: row.year }),
    ...(row.genre !== null && { genre: row.genre }),
    ...(row.overview !== null && { overview: row.overview }),
  }
}

function toValues(movie: MovieInput) {
  return [
    movie.title,
    movie.posterURL,
    movie.imdbId ?? null,
    movie.year ?? null,
    movie.genre ?? null,
    movie.overview ?? null,
  ]
}

export async function findAll(owner: string): Promise<Movie[]> {
  const [rows] = await pool.query<MovieRow[]>(
    `SELECT ${COLUMNS} FROM movies WHERE owner_email = ? ORDER BY id DESC`,
    [owner],
  )
  return rows.map(toMovie)
}

export async function findPage(
  owner: string,
  search: string,
  limit: number,
  offset: number,
): Promise<{ movies: Movie[]; total: number }> {
  const like = `%${search.replace(/[\\%_]/g, '\\$&')}%`
  const [rows] = await pool.query<MovieRow[]>(
    `SELECT ${COLUMNS} FROM movies
     WHERE owner_email = ? AND title LIKE ?
     ORDER BY id DESC
     LIMIT ? OFFSET ?`,
    [owner, like, limit, offset],
  )
  const [count] = await pool.query<(RowDataPacket & { total: number })[]>(
    'SELECT COUNT(*) AS total FROM movies WHERE owner_email = ? AND title LIKE ?',
    [owner, like],
  )
  return { movies: rows.map(toMovie), total: count[0].total }
}

export async function findById(owner: string, id: number): Promise<Movie | null> {
  const [rows] = await pool.query<MovieRow[]>(
    `SELECT ${COLUMNS} FROM movies WHERE owner_email = ? AND id = ?`,
    [owner, id],
  )
  return rows[0] ? toMovie(rows[0]) : null
}

export async function insert(owner: string, movie: MovieInput): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO movies (owner_email, title, poster_url, imdb_id, year, genre, overview)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [owner, ...toValues(movie)],
  )
  return result.insertId
}

export async function update(owner: string, id: number, movie: MovieInput): Promise<void> {
  await pool.query(
    `UPDATE movies
     SET title = ?, poster_url = ?, imdb_id = ?, year = ?, genre = ?, overview = ?
     WHERE owner_email = ? AND id = ?`,
    [...toValues(movie), owner, id],
  )
}

export async function remove(owner: string, id: number): Promise<void> {
  await pool.query('DELETE FROM movies WHERE owner_email = ? AND id = ?', [owner, id])
}

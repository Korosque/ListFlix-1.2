import { BookmarkPlus, Pencil, X } from 'lucide-react'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import type { Movie, MovieInput } from '../types/movie'
import { errorMessage } from '../utils/movies'

interface MovieFormProps {
  /** Filme em edição; sem ele o formulário cadastra. Use `key` para trocar de filme. */
  editing: Movie | null
  onSave: (movie: MovieInput) => Promise<void>
  onCancel: () => void
}

const blank = { title: '', posterURL: '', year: '', genre: '', overview: '' }

export function MovieForm({ editing, onSave, onCancel }: MovieFormProps) {
  const [form, setForm] = useState(
    editing
      ? {
          title: editing.title,
          posterURL: editing.posterURL,
          year: editing.year ? String(editing.year) : '',
          genre: editing.genre ?? '',
          overview: editing.overview ?? '',
        }
      : blank,
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const field = (name: keyof typeof blank) => ({
    value: form[name],
    onChange: (event: ChangeEvent<HTMLInputElement>) => setForm({ ...form, [name]: event.target.value }),
  })

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave({
        title: form.title.trim(),
        posterURL: form.posterURL.trim(),
        year: form.year ? Number(form.year) : undefined,
        genre: form.genre.trim() || undefined,
        overview: form.overview.trim() || undefined,
      })
      if (!editing) setForm(blank)
    } catch (e) {
      setError(errorMessage(e, 'Não foi possível salvar o filme.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="movie-form" onSubmit={submit}>
      <div className="form-heading">
        <strong>{editing ? 'Editar filme' : 'Adicionar filme'}</strong>
        {editing && (
          <button type="button" className="secondary-button" onClick={onCancel}>
            <X size={14} /> Cancelar edição
          </button>
        )}
      </div>
      <div className="movie-form-fields">
        <label>
          Título
          <input required maxLength={255} placeholder="Nome do filme" {...field('title')} />
        </label>
        <label>
          URL do pôster
          <input required type="url" placeholder="https://..." {...field('posterURL')} />
        </label>
        <label>
          Ano
          <input type="number" min="1888" max="2100" placeholder="2026" {...field('year')} />
        </label>
        <label>
          Gênero
          <input maxLength={50} placeholder="Drama" {...field('genre')} />
        </label>
        <label className="wide-field">
          Sinopse
          <input maxLength={2000} placeholder="Uma breve descrição (opcional)" {...field('overview')} />
        </label>
      </div>
      <div className="movie-form-actions">
        <button className="primary-button" disabled={saving}>
          {saving ? (
            'Salvando…'
          ) : editing ? (
            <>
              <Pencil size={15} /> Salvar edição
            </>
          ) : (
            <>
              <BookmarkPlus size={15} /> Cadastrar filme
            </>
          )}
        </button>
        {error && <span role="alert" className="form-feedback-error">{error}</span>}
      </div>
    </form>
  )
}

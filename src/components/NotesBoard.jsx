import { useMemo, useState } from 'react'
import { BookOpenCheck, LockKeyhole, NotebookPen, Save, Share2, Trash2 } from 'lucide-react'
import { createId, formatTime } from '../data/studyUtils'

function NotesBoard({ notes, currentUser, onNotesChange }) {
  const [form, setForm] = useState({ title: '', content: '', visibility: 'Shared' })
  const [error, setError] = useState('')

  const visibleNotes = useMemo(() => {
    return notes.filter((note) => note.visibility === 'Shared' || note.owner === currentUser)
  }, [currentUser, notes])
  const noteCounts = useMemo(() => {
    return visibleNotes.reduce(
      (counts, note) => ({
        ...counts,
        [note.visibility]: (counts[note.visibility] || 0) + 1,
      }),
      { Private: 0, Shared: 0 },
    )
  }, [visibleNotes])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.title.trim() || !form.content.trim()) {
      setError('Note title and content are required.')
      return
    }

    const note = {
      id: createId('note'),
      title: form.title.trim(),
      content: form.content.trim(),
      visibility: form.visibility,
      owner: currentUser,
      createdAt: new Date().toISOString(),
    }

    onNotesChange([note, ...notes], `${currentUser} saved a ${note.visibility.toLowerCase()} note.`, 'note')
    setForm({ title: '', content: '', visibility: 'Shared' })
  }

  const deleteNote = (note) => {
    const next = notes.filter((item) => item.id !== note.id)
    onNotesChange(next, `${currentUser} deleted "${note.title}" from study notes.`, 'note')
  }

  return (
    <section className="glass-card room-card">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Study notes</span>
          <h2>Capture what matters</h2>
          <p className="section-support">
            Keep formulas, reminders, and "please explain this later" moments where both of you can find them.
          </p>
        </div>
        <NotebookPen size={24} aria-hidden="true" />
      </div>

      <div className="room-status-strip">
        <span className="room-badge">
          <BookOpenCheck size={15} />
          {noteCounts.Shared} shared notes
        </span>
        <span className="room-badge">{noteCounts.Private} private notes visible to you</span>
      </div>

      <form className="notes-form" onSubmit={handleSubmit}>
        <input
          className="form-control"
          value={form.title}
          onChange={(event) => updateField('title', event.target.value)}
          placeholder="Memory title"
          aria-label="Note title"
        />
        <select
          className="form-select"
          value={form.visibility}
          onChange={(event) => updateField('visibility', event.target.value)}
          aria-label="Note visibility"
        >
          <option>Shared</option>
          <option>Private</option>
        </select>
        <textarea
          className="form-control"
          rows="4"
          value={form.content}
          onChange={(event) => updateField('content', event.target.value)}
          placeholder="Write a formula, reminder, stuck question, or tiny victory..."
          aria-label="Note content"
        />
        {error ? <p className="form-error">{error}</p> : null}
        <button className="btn glow-btn" type="submit">
          <Save size={17} />
          Save Note
        </button>
      </form>

      <div className="notes-grid">
        {visibleNotes.length ? (
          visibleNotes.map((note) => (
            <article className="note-card" key={note.id}>
              <div className="note-top">
                <span className="note-visibility">
                  {note.visibility === 'Shared' ? <Share2 size={15} /> : <LockKeyhole size={15} />}
                  {note.visibility}
                </span>
                <button
                  className="icon-btn"
                  type="button"
                  aria-label={`Delete ${note.title}`}
                  onClick={() => deleteNote(note)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              <span className="note-kind">Saved for later clarity</span>
              <small>
                {note.owner} - {formatTime(note.createdAt)}
              </small>
            </article>
          ))
        ) : (
          <p className="empty-state">No notes yet. Save the first one after your next study block.</p>
        )}
      </div>
    </section>
  )
}

export default NotesBoard

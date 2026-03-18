export default function NoteItem({ note }) {
  const date = new Date(note.created_at).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="note-item">
      <div className="note-meta">
        <span className="note-author">✦ {note.created_by}</span>
        <span className="note-date">{date}</span>
      </div>
      <p className="note-text">{note.note_text}</p>
    </div>
  );
}

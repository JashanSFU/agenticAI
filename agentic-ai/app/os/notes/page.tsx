import { db } from "@/lib/db";

export default function NotesPage() {
  const notes = db.notes;

  return (
    <div className="space-y-4">
      <header className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Notes</h1>
        <a
          href="/dashboard/agent"
          className="text-sm text-primary underline-offset-2 hover:underline"
        >
          Add a note via AI
        </a>
      </header>

      {notes.length === 0 ? (
        <div className="rounded-xl border p-4 bg-card shadow-sm text-muted-foreground text-sm">
          No notes yet. Use the Agent to create one.
        </div>
      ) : (
        <div className="grid gap-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="border rounded-xl p-4 bg-card shadow-sm"
            >
              <h3 className="font-medium">{note.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {note.content}
              </p>
              <div className="mt-2 text-xs opacity-60">
                Updated {new Date(note.updatedAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

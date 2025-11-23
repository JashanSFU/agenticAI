import { db } from "@/lib/db";

export default function JournalPage() {
  const entries = db.journal;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Journal</h1>

      {entries.length === 0 ? (
        <div className="rounded-xl border p-4 bg-card shadow-sm text-muted-foreground text-sm">
          No journal entries yet.
        </div>
      ) : (
        <div className="grid gap-3">
          {entries.map((j) => (
            <div key={j.id} className="border rounded-xl p-4 bg-card shadow-sm">
              <div className="flex justify-between mb-2">
                <span className="font-medium">{j.date}</span>
                {j.mood && (
                  <span className="text-xs px-2 py-1 rounded bg-secondary">
                    {j.mood}
                  </span>
                )}
              </div>

              <p className="text-sm whitespace-pre-wrap">{j.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

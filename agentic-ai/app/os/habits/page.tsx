import { db } from "@/lib/db";

export default function HabitsPage() {
  const habits = db.habits;
  const logs = db.habitLogs;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Habits</h1>

      {habits.length === 0 ? (
        <div className="rounded-xl border p-4 bg-card shadow-sm text-muted-foreground text-sm">
          No habits yet. Ask the Agent to create one.
        </div>
      ) : (
        <div className="grid gap-3">
          {habits.map((h) => {
            const count = logs.filter((l) => l.habitId === h.id).length;

            return (
              <div
                key={h.id}
                className="border rounded-xl p-4 bg-card shadow-sm"
              >
                <h3 className="font-medium">{h.name}</h3>
                {h.description && (
                  <p className="text-sm text-muted-foreground">
                    {h.description}
                  </p>
                )}

                <div className="mt-2 text-xs opacity-60">
                  Entries logged: {count}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

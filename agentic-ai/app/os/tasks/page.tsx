import { db } from "@/lib/db";

export default function TasksPage() {
  const tasks = db.tasks;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Tasks</h1>

      {tasks.length === 0 ? (
        <div className="rounded-xl border p-4 bg-card shadow-sm text-muted-foreground text-sm">
          No tasks yet. Ask the Agent to create one.
        </div>
      ) : (
        <div className="grid gap-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="border rounded-xl p-4 bg-card shadow-sm"
            >
              <h3 className="font-medium flex justify-between">
                {task.title}
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    task.status === "done"
                      ? "bg-green-200 text-green-700"
                      : "bg-yellow-200 text-yellow-700"
                  }`}
                >
                  {task.status}
                </span>
              </h3>

              {task.description && (
                <p className="text-sm text-muted-foreground">
                  {task.description}
                </p>
              )}

              <div className="mt-2 text-xs opacity-60">
                Updated {new Date(task.updatedAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

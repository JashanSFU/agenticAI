import { getTodayDashboardData } from "./_data/dashboard";
import {
  getAIInsights,
  getDailyReflection,
  getAutoschedule,
} from "./_data/intelligence";

export default async function OSHome() {
  const {
    today,
    todaysJournal,
    todaysTasks,
    recentNotes,
    habits,
    habitLogsToday,
  } = getTodayDashboardData();

  // AI intelligence
  const insights = await getAIInsights();
  const reflection = await getDailyReflection();
  const autoschedule = await getAutoschedule();

  return (
    <div className="space-y-10">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold">Today</h1>
        <p className="text-muted-foreground text-sm">{today}</p>
      </header>

      {/* Daily Reflection */}
      <section className="p-6 rounded-xl border bg-card shadow-sm space-y-3">
        <h2 className="font-semibold">AI Daily Reflection</h2>
        {reflection ? (
          <pre className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/80">
            {JSON.stringify(reflection, null, 2)}
          </pre>
        ) : (
          <p className="text-muted-foreground text-sm">
            No reflection yet. Ask your agent: “Reflect on today.”
          </p>
        )}
      </section>

      {/* Autoschedule */}
      <section className="p-6 rounded-xl border bg-card shadow-sm space-y-3">
        <h2 className="font-semibold">Suggested Schedule</h2>

        {autoschedule ? (
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium">Morning</h3>
              <ul className="ml-4 list-disc">
                {autoschedule.suggestion.morning.map((t: any) => (
                  <li key={t.id}>{t.title}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-medium">Midday</h3>
              <ul className="ml-4 list-disc">
                {autoschedule.suggestion.midday.map((t: any) => (
                  <li key={t.id}>{t.title}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-medium">Evening</h3>
              <ul className="ml-4 list-disc">
                {autoschedule.suggestion.evening.map((t: any) => (
                  <li key={t.id}>{t.title}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No schedule suggestion yet.
          </p>
        )}
      </section>

      {/* Insights Panel */}
      <section className="p-6 rounded-xl border bg-card shadow-sm">
        <h2 className="font-semibold mb-3">AI Insights</h2>

        {insights ? (
          <pre className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/80">
            {JSON.stringify(insights, null, 2)}
          </pre>
        ) : (
          <p className="text-muted-foreground text-sm">
            Insights not available.
          </p>
        )}
      </section>

      {/* Today's Tasks */}
      <section className="p-4 rounded-xl border bg-card shadow-sm">
        <h2 className="font-semibold mb-3">Tasks Due Today</h2>

        {todaysTasks.length === 0 ? (
          <p className="text-muted-foreground text-sm">No tasks due today.</p>
        ) : (
          <ul className="space-y-2">
            {todaysTasks.map((t) => (
              <li
                key={t.id}
                className="p-3 rounded-lg border bg-background text-sm flex justify-between"
              >
                <span>{t.title}</span>
                <span className="opacity-60">{t.priority}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Journal */}
      <section className="p-4 rounded-xl border bg-card shadow-sm">
        <h2 className="font-semibold mb-3">Journal Entry</h2>

        {todaysJournal ? (
          <p className="text-sm whitespace-pre-line">{todaysJournal.content}</p>
        ) : (
          <p className="text-muted-foreground text-sm">
            No journal entry yet today.
          </p>
        )}
      </section>

      {/* Habits */}
      <section className="p-4 rounded-xl border bg-card shadow-sm">
        <h2 className="font-semibold mb-3">Habit Activity</h2>

        {habitLogsToday.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No habits logged today.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {habitLogsToday.map((l) => {
              const h = habits.find((h) => h.id === l.habitId);
              return (
                <li
                  key={l.id}
                  className="p-3 border rounded-lg bg-background flex justify-between"
                >
                  <span>{h?.name || "Habit"}</span>
                  <span className="opacity-60">{l.value || ""}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Recent Notes */}
      <section className="p-4 rounded-xl border bg-card shadow-sm">
        <h2 className="font-semibold mb-3">Recent Notes</h2>

        {recentNotes.length === 0 ? (
          <p className="text-muted-foreground text-sm">No notes yet.</p>
        ) : (
          <ul className="space-y-2">
            {recentNotes.map((n) => (
              <li
                key={n.id}
                className="p-3 rounded-lg border bg-background text-sm"
              >
                <div className="font-medium">{n.title}</div>
                <div className="text-muted-foreground line-clamp-2 text-xs">
                  {n.content}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

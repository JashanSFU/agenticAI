// app/os/layout.tsx
export default function OSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border p-4 flex flex-col gap-3">
        <h2 className="font-semibold text-lg mb-2">AI OS</h2>

        <nav className="flex flex-col gap-2">
          <a href="/os" className="text-sm hover:text-primary">
            Dashboard
          </a>
          <a href="/os/notes" className="text-sm hover:text-primary">
            Notes
          </a>
          <a href="/os/tasks" className="text-sm hover:text-primary">
            Tasks
          </a>
          <a href="/os/journal" className="text-sm hover:text-primary">
            Journal
          </a>
          <a href="/os/habits" className="text-sm hover:text-primary">
            Habits
          </a>
          <a href="/os/graph" className="text-sm hover:text-primary">
            Graph
          </a>
          <a href="/dashboard/agent" className="text-sm hover:text-primary">
            Agent
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}

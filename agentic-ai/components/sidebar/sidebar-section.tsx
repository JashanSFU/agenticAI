"use client";

interface Props {
  title: string;
  children: React.ReactNode;
}

export function SidebarSection({ title, children }: Props) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
        {title}
      </p>

      <div className="space-y-1">{children}</div>
    </div>
  );
}

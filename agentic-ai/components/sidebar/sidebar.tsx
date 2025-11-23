// components/sidebar/sidebar.tsx
"use client";

import { SidebarItem } from "./sidebar-item";
import { SidebarSection } from "./sidebar-section";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Sidebar() {
  return (
    <div className="w-64 border-r h-screen p-4 flex flex-col bg-background">
      <h1 className="text-xl font-bold mb-8">AgenticAI</h1>

      {/* AGENT */}
      <SidebarSection title="Agent">
        <SidebarItem href="/agent" label="AI Agent" icon="message-square" />
      </SidebarSection>

      {/* CRM */}
      <SidebarSection title="CRM">
        <SidebarItem href="/leads" label="Leads" icon="users" />
      </SidebarSection>

      {/* CALENDAR */}
      <SidebarSection title="Calendar">
        <SidebarItem href="/meetings" label="Meetings" icon="calendar" />
      </SidebarSection>

      {/* SYSTEM */}
      <SidebarSection title="System">
        <SidebarItem href="/logs" label="Tool Logs" icon="file-search" />
      </SidebarSection>

      <div className="mt-auto pt-6 border-t">
        <SidebarItem href="/settings" label="Settings" icon="settings" />
        <div className="mt-4">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

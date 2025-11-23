"use client";

import useSWR from "swr";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  // Live data
  const { data: leads, mutate: refreshLeads } = useSWR(
    "/api/debug/leads",
    fetcher
  );
  const { data: meetings, mutate: refreshMeetings } = useSWR(
    "/api/debug/meetings",
    fetcher
  );

  async function sendMessage() {
    if (!prompt.trim()) return;

    const userMsg = { role: "user", text: prompt };
    setMessages((prev) => [...prev, userMsg]);

    const res = await fetch("/api/agent", {
      method: "POST",
      body: JSON.stringify({ message: prompt }),
      headers: { "Content-Type": "application/json" },
    });

    const json = await res.json();
    const agentMsg = { role: "assistant", text: json.data };

    setMessages((prev) => [...prev, agentMsg]);
    setPrompt("");

    // Refresh data panels
    refreshLeads();
    refreshMeetings();
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
      {/* Agent Panel */}
      <Card className="col-span-1 h-[85vh] flex flex-col">
        <CardHeader>
          <CardTitle>🤖 Agentic AI</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-1">
          <div className="flex-1 overflow-y-auto border rounded-lg p-3 bg-muted">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`mb-3 ${m.role === "user" ? "text-right" : ""}`}
              >
                <div
                  className={`inline-block px-3 py-2 rounded-lg text-sm 
                  ${
                    m.role === "user"
                      ? "bg-primary text-white"
                      : "bg-white border"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Ask me to schedule, manage leads, plan tasks..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button onClick={sendMessage}>Send</Button>
          </div>
        </CardContent>
      </Card>

      {/* Leads Panel */}
      <Card className="col-span-1 h-[85vh] overflow-hidden flex flex-col">
        <CardHeader>
          <CardTitle>📇 CRM Leads</CardTitle>
        </CardHeader>

        <CardContent className="overflow-y-auto flex-1">
          {!leads?.length && (
            <p className="text-sm text-muted-foreground">No leads yet.</p>
          )}

          {leads?.map((lead: any) => (
            <div key={lead.id} className="border-b py-3">
              <p className="font-medium">{lead.name}</p>
              {lead.company && <p className="text-sm">🏢 {lead.company}</p>}
              {lead.email && (
                <p className="text-xs text-muted-foreground">✉ {lead.email}</p>
              )}
              <p className="text-xs mt-1">
                Status: <span className="font-semibold">{lead.status}</span>
              </p>
              {lead.notes && (
                <p className="mt-1 text-xs italic text-muted-foreground">
                  {lead.notes}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Meetings Panel */}
      <Card className="col-span-1 h-[85vh] overflow-hidden flex flex-col">
        <CardHeader>
          <CardTitle>📅 Calendar</CardTitle>
        </CardHeader>

        <CardContent className="overflow-y-auto flex-1">
          {!meetings?.length && (
            <p className="text-sm text-muted-foreground">No meetings.</p>
          )}

          {meetings?.map((m: any) => (
            <div key={m.id} className="border-b py-3">
              <p className="font-medium">{m.title}</p>
              <p className="text-sm text-muted-foreground">
                {m.date} at {m.time}
              </p>

              {m.attendees?.length > 0 && (
                <p className="text-xs mt-1">👥 {m.attendees.join(", ")}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

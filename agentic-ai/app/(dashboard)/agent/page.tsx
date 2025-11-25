"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type AgentMessage = {
  role: "user" | "assistant";
  text: string;
  ts: Date;
  toolUsed?: string | null;
  toolArgs?: any;
  toolResult?: any;
  thought?: string | null;
};

export default function AgentPage() {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    if (!prompt.trim() || loading) return;

    const userMsg: AgentMessage = {
      role: "user",
      text: prompt,
      ts: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");
    setLoading(true);

    const res = await fetch("/api/agent", {
      method: "POST",
      body: JSON.stringify({ message: userMsg.text }),
      headers: { "Content-Type": "application/json" },
    });

    const json = await res.json();
    console.log("Agent result:", json);

    const assistantMsg: AgentMessage = {
      role: "assistant",
      text: json.final,
      toolUsed: json.toolUsed,
      toolArgs: json.toolArgs,
      toolResult: json.result,
      thought: json.agentThought,
      ts: new Date(),
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-[92vh] max-w-3xl mx-auto py-6 px-4">
      {/* HEADER */}
      <div className="mb-4 text-center">
        <h1 className="text-xl font-semibold text-foreground/90">
          Agentic AI Desk
        </h1>
        <p className="text-sm text-muted-foreground">
          Smart assistant • Automations • Tools • CRM • Scheduling
        </p>
      </div>

      {/* CHAT AREA */}
      <div
        className="
          flex-1 overflow-y-auto px-4 py-6 rounded-3xl space-y-6
          bg-card/50 backdrop-blur-sm border border-border shadow-lg
        "
      >
        {messages.map((m, i) => (
          <MessageBubble key={i} msg={m} />
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-2 items-center px-4 py-3 bg-muted border border-border rounded-xl shadow-sm">
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-150" />
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-300" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT BOX */}
      <div
        className="
          flex gap-3 items-center mt-4 p-3 rounded-xl
          bg-background/80 backdrop-blur-xl border border-border shadow-md
          sticky bottom-4 z-10
        "
      >
        <Input
          ref={inputRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Message your agent..."
          className="flex-1 rounded-xl bg-muted/40 border border-input"
        />

        <Button
          onClick={sendMessage}
          disabled={loading}
          className="rounded-xl px-6 shadow-md"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            "Send"
          )}
        </Button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* 🌟 Message Bubble Component                                             */
/* ---------------------------------------------------------------------- */

function MessageBubble({ msg }: { msg: AgentMessage }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`flex ${
        msg.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] px-4 py-3 rounded-xl shadow animate-in fade-in slide-in-from-bottom-2 duration-200
          ${
            msg.role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground border border-border"
          }`}
      >
        {/* Main text */}
        <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>

        {/* Timestamp */}
        <p className="mt-1 text-[10px] opacity-50 text-right">
          {msg.ts.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        {/* TOOL PANEL */}
        {(msg.toolUsed || msg.thought) && (
          <div className="mt-3">
            <button
              onClick={() => setOpen(!open)}
              className="text-xs underline opacity-70 hover:opacity-100"
            >
              {open ? "Hide Details" : "Show Details"}
            </button>

            {open && (
              <div className="mt-2 p-3 rounded-lg bg-background/40 border border-border text-xs space-y-2">
                <ToolItem label="🔧 Tool Used" value={msg.toolUsed} />
                <ToolItem label="Arguments" value={msg.toolArgs} />
                <ToolItem label="Result" value={msg.toolResult} />
                <ToolItem label="Agent Thought" value={msg.thought} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* 🌟 Tool Inspector Item                                                 */
/* ---------------------------------------------------------------------- */

function ToolItem({ label, value }: { label: string; value: any }) {
  if (!value) return null;
  return (
    <div>
      <p className="font-semibold">{label}:</p>
      <pre className="text-[11px] whitespace-pre-wrap bg-accent/20 p-2 rounded">
        {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

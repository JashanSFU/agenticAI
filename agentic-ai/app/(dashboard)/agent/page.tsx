// "use client";

// import { useState, useRef, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";

// export default function AgentPage() {
//   const [messages, setMessages] = useState<any[]>([]);
//   const [prompt, setPrompt] = useState("");
//   const bottomRef = useRef<HTMLDivElement>(null);

//   async function sendMessage() {
//     if (!prompt.trim()) return;

//     setMessages((prev) => [...prev, { role: "user", text: prompt }]);

//     const res = await fetch("/api/agent", {
//       method: "POST",
//       body: JSON.stringify({ message: prompt }),
//       headers: { "Content-Type": "application/json" },
//     });

//     const json = await res.json();

//     setMessages((prev) => [...prev, { role: "assistant", text: json.data }]);

//     setPrompt("");
//   }

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   return (
//     <div className="max-w-3xl mx-auto flex flex-col h-[85vh]">
//       <div className="flex-1 overflow-y-auto p-4 bg-muted rounded-lg">
//         {messages.map((m, i) => (
//           <div
//             key={i}
//             className={`my-2 ${m.role === "user" ? "text-right" : "text-left"}`}
//           >
//             <span
//               className={`inline-block px-3 py-2 rounded-xl text-sm ${
//                 m.role === "user"
//                   ? "bg-primary text-primary-foreground"
//                   : "bg-background border"
//               }`}
//             >
//               {m.text}
//             </span>
//           </div>
//         ))}
//         <div ref={bottomRef} />
//       </div>

//       <div className="mt-3 flex gap-2">
//         <Input
//           placeholder="Ask the agent anything..."
//           value={prompt}
//           onChange={(e) => setPrompt(e.target.value)}
//         />
//         <Button onClick={sendMessage}>Send</Button>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AgentPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Enter to send
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  async function sendMessage() {
    if (!prompt.trim() || loading) return;

    const userMsg = { role: "user", text: prompt, ts: new Date(), anim: true };
    setMessages((prev) => [...prev, userMsg]);

    setPrompt("");
    setLoading(true);

    const res = await fetch("/api/agent", {
      method: "POST",
      body: JSON.stringify({ message: userMsg.text }),
      headers: { "Content-Type": "application/json" },
    });

    const json = await res.json();

    const assistantMsg = {
      role: "assistant",
      text: json.data,
      ts: new Date(),
      anim: true,
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setLoading(false);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[85vh] px-4">
      {/* Chat Area */}
      <div
        className="
        flex-1 overflow-y-auto p-6 
        rounded-xl border shadow-inner backdrop-blur-sm 
        bg-gradient-to-b from-muted/60 to-muted/20 
        dark:from-zinc-900/60 dark:to-zinc-900/20
      "
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`my-3 flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`
                max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-sm 
                transition-all duration-300 
                animate-in fade-in slide-in-from-bottom-2  
                ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-white dark:bg-zinc-800 border dark:border-zinc-700"
                }
              `}
            >
              <p>{m.text}</p>
              <p className="mt-1 text-[10px] opacity-60 text-right">
                {m.ts.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Bubbles */}
        {loading && (
          <div className="flex justify-start my-3">
            <div
              className="
              bg-white dark:bg-zinc-800 border px-4 py-3 rounded-2xl shadow-sm 
              flex gap-2 animate-fade-in
            "
            >
              <span className="w-2 h-2 bg-zinc-500 dark:bg-zinc-300 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-zinc-500 dark:bg-zinc-300 rounded-full animate-bounce delay-150"></span>
              <span className="w-2 h-2 bg-zinc-500 dark:bg-zinc-300 rounded-full animate-bounce delay-300"></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="mt-4 flex gap-3 items-center sticky bottom-0 py-2 bg-background/80 backdrop-blur-md">
        <Input
          ref={inputRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the Agent to schedule, manage CRM, plan tasks..."
          className="flex-1 rounded-xl shadow-sm"
        />
        <Button
          onClick={sendMessage}
          disabled={loading}
          className="rounded-xl min-w-[72px] flex justify-center"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Send"
          )}
        </Button>
      </div>
    </div>
  );
}

// "use client";

// import { useState, useRef, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";

// export default function AgentPage() {
//   const [messages, setMessages] = useState<any[]>([]);
//   const [prompt, setPrompt] = useState("");
//   const [loading, setLoading] = useState(false);

//   const bottomRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     inputRef.current?.focus();
//   }, []);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, loading]);

//   function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   }

//   async function sendMessage() {
//     if (!prompt.trim() || loading) return;

//     const userMsg = {
//       role: "user",
//       text: prompt,
//       ts: new Date(),
//     };
//     setMessages((prev) => [...prev, userMsg]);

//     setPrompt("");
//     setLoading(true);

//     const res = await fetch("/api/agent", {
//       method: "POST",
//       body: JSON.stringify({ message: userMsg.text }),
//       headers: { "Content-Type": "application/json" },
//     });

//     const json = await res.json();

//     const assistantMsg = {
//       role: "assistant",
//       text: json.data,
//       ts: new Date(),
//     };

//     setMessages((prev) => [...prev, assistantMsg]);
//     setLoading(false);
//   }

//   return (
//     <div className="flex flex-col h-[90vh] max-w-3xl mx-auto py-6 px-4">
//       {/* HEADER */}
//       <div className="mb-4 text-center">
//         <h1 className="text-xl font-semibold text-foreground/90">
//           Your Personal Agent
//         </h1>
//         <p className="text-sm text-muted-foreground">
//           Ask anything • Schedule • CRM • Tasks
//         </p>
//       </div>

//       {/* CHAT AREA */}
//       <div
//         className="
//           flex-1 overflow-y-auto px-4 py-6 rounded-3xl
//           bg-background/40 backdrop-blur-sm
//           border border-border/40 shadow-lg
//           space-y-4
//         "
//       >
//         {messages.map((m, i) => (
//           <div
//             key={i}
//             className={`flex ${
//               m.role === "user" ? "justify-end" : "justify-start"
//             }`}
//           >
//             <div
//               className={`
//                 max-w-[75%] px-4 py-3 rounded-2xl shadow
//                 animate-in fade-in slide-in-from-bottom-2 duration-200
//                 ${
//                   m.role === "user"
//                     ? "bg-blue-600 text-white"
//                     : "bg-white dark:bg-zinc-900 border border-border/50"
//                 }
//               `}
//             >
//               <p className="leading-relaxed">{m.text}</p>
//               <p className="mt-1 text-[10px] opacity-50 text-right">
//                 {m.ts.toLocaleTimeString([], {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 })}
//               </p>
//             </div>
//           </div>
//         ))}

//         {/* TYPING INDICATOR */}
//         {loading && (
//           <div className="flex justify-start">
//             <div
//               className="
//                 flex gap-2 items-center px-4 py-3
//                 bg-white dark:bg-zinc-900 border border-border/50 rounded-2xl shadow-sm
//               "
//             >
//               <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" />
//               <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce delay-150" />
//               <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce delay-300" />
//             </div>
//           </div>
//         )}

//         <div ref={bottomRef} />
//       </div>

//       {/* INPUT AREA */}
//       <div
//         className="
//           flex gap-3 items-center mt-4 p-3 rounded-2xl
//           bg-background/80 backdrop-blur-xl border shadow-md
//           sticky bottom-4 z-10
//         "
//       >
//         <Input
//           ref={inputRef}
//           value={prompt}
//           onChange={(e) => setPrompt(e.target.value)}
//           onKeyDown={handleKeyDown}
//           placeholder="Message your agent..."
//           className="flex-1 rounded-xl bg-muted/40 border-none focus-visible:ring-0"
//         />
//         <Button
//           onClick={sendMessage}
//           disabled={loading}
//           className="rounded-xl px-6 shadow-md"
//         >
//           {loading ? (
//             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//           ) : (
//             "Send"
//           )}
//         </Button>
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

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    if (!prompt.trim() || loading) return;

    const userMsg = {
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

    const assistantMsg = {
      role: "assistant",
      text: json.data,
      ts: new Date(),
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-[90vh] max-w-3xl mx-auto py-6 px-4">
      {/* HEADER */}
      <div className="mb-4 text-center">
        <h1 className="text-xl font-semibold text-foreground/90">
          Your Personal Agent
        </h1>
        <p className="text-sm text-muted-foreground">
          Ask anything • Automations • CRM • Scheduling
        </p>
      </div>

      {/* CHAT AREA */}
      <div
        className="
          flex-1 overflow-y-auto px-4 py-6 rounded-3xl
          bg-card/50 backdrop-blur-sm border border-border shadow-lg
          space-y-4
        "
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`
                max-w-[75%] px-4 py-3 rounded-[var(--radius-xl)] shadow
                animate-in fade-in slide-in-from-bottom-2 duration-200
                ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground border border-border"
                }
              `}
            >
              <p className="leading-relaxed">{m.text}</p>
              <p className="mt-1 text-[10px] opacity-50 text-right">
                {m.ts.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {/* TYPING INDICATOR */}
        {loading && (
          <div className="flex justify-start">
            <div
              className="
                flex gap-2 items-center px-4 py-3
                bg-muted border border-border rounded-[var(--radius-xl)]
              "
            >
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-150" />
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-300" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT AREA */}
      <div
        className="
          flex gap-3 items-center mt-4 p-3 rounded-[var(--radius-xl)]
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
          className="
            flex-1 rounded-xl bg-muted/40 text-foreground
            border border-input focus-visible:ring-ring
          "
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

"use client";

import { useState } from "react";

export default function TestAgent() {
  const [message, setMessage] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const testAgent = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setOutput("");

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        body: JSON.stringify({ message }),
        headers: { "Content-Type": "application/json" },
      });

      const json = await res.json();
      setOutput(JSON.stringify(json, null, 2));
    } catch (err) {
      setOutput("Error connecting to agent.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0e0e0f] text-gray-200 flex flex-col items-center pt-10 px-4">
      <div className="w-full max-w-xl bg-[#1a1a1d] border border-[#2a2a2d] shadow-xl rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          🛍️ Agentic Commerce Demo
        </h1>

        {/* Input */}
        <div className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Ask something… e.g. "Do you have hoodies?"'
            className="flex-1 border border-[#3a3a3d] bg-[#121214] rounded-lg px-4 py-2 text-lg 
                       focus:ring-2 focus:ring-blue-500 outline-none text-gray-100 placeholder-gray-500"
          />

          <button
            onClick={testAgent}
            disabled={loading}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 
                       transition disabled:opacity-40"
          >
            {loading ? "…" : "Send"}
          </button>
        </div>

        {/* Response Box */}
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2 text-gray-300">Response</h2>

          <div
            className="bg-[#121214] border border-[#2a2a2d] rounded-lg p-4 h-64 overflow-auto 
                       whitespace-pre-wrap font-mono text-sm"
          >
            {loading
              ? "Thinking…"
              : output || "Ask a question to see the result here."}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

export default function AssistantPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "bot"; text: string }[]
  >([
    {
      role: "bot",
      text: "I'm DIGITπ Assistant. Ask about water, plumbing, or buying on the app.",
    },
  ]);

  const send = () => {
    if (!input.trim()) return;
    const q = input.trim();
    setMessages((m) => [
      ...m,
      { role: "user", text: q },
      {
        role: "bot",
        text: "Thanks for describing the issue. For now this is a temporary reply. Soon you'll get step-by-step help for water, plumbing, and purchases.",
      },
    ]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-[#142A2E] text-white">
      <div className="max-w-3xl mx-auto p-6 lg:p-10 flex flex-col min-h-screen">
        <Link href="/buyer" className="text-sm text-[#7EB6B8]">
          ← Home
        </Link>
        <h1 className="text-2xl font-bold mt-2 mb-6">Assistant</h1>

        <div className="flex-1 space-y-3 mb-4 overflow-y-auto">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                m.role === "user"
                  ? "ml-auto bg-[#0F6E76] text-white"
                  : "bg-[#1B3338] border border-white/10 text-[#C7D6D4]"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about water or plumbing..."
            className="flex-1 bg-[#1B3338] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#8B9998]"
          />
          <button
            onClick={send}
            className="px-5 rounded-xl bg-[#0F6E76] font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
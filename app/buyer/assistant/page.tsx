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
    <div className="min-h-screen bg-[#0B1C1F] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl border border-white/10">
        <div className="bg-[#142A2E] rounded-[2rem] overflow-hidden min-h-[640px] flex flex-col">
          
          <div className="flex items-center gap-3 px-5 pt-6 pb-3">
            <Link
              href="/buyer"
              className="w-8 h-8 rounded-full bg-[#1B3338] border border-white/10 flex items-center justify-center text-white"
            >
              ←
            </Link>
            <h1 className="text-[16px] font-bold text-white">Assistant</h1>
          </div>

          <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] ${
                  m.role === "user"
                    ? "ml-auto bg-[#0F6E76] text-white"
                    : "bg-[#1B3338] border border-white/10 text-[#C7D6D4]"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="px-5 pb-6 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about water or plumbing..."
              className="flex-1 bg-[#1B3338] border border-white/10 rounded-full px-4 py-3 text-[13px] text-white outline-none placeholder:text-[#8B9998]"
            />
            <button
              onClick={send}
              className="px-4 rounded-full bg-[#0F6E76] text-white text-[13px] font-medium"
            >
              Send
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

type ToolOutput = {
  content?: { text?: string }[];
  isError?: boolean;
};

export default function ChatPage() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat();
  const busy = status === "submitted" || status === "streaming";

  return (
    <main className="mx-auto max-w-2xl p-4">
      <h1 className="mb-4 text-2xl font-bold">Ассистент</h1>
      
      {messages.map((m) => (
        <div
          key={m.id}
          className={`mb-3 rounded-lg p-3 ${
            m.role === "user" ? "bg-indigo-50" : "bg-white"
          }`}
        >
          <b>{m.role === "user" ? "Вы" : "Ассистент"}</b>
          {m.parts.map((part, i) => {
            if (part.type === "text") {
              return <p key={i}>{part.text}</p>;
            }
            if (part.type === "dynamic-tool") {
              let text = "выполняется…";
              let failed = false;
              if (part.state === "output-available") {
                const out = part.output as ToolOutput;
                const parts = out.content ?? [];
                text = parts.map((c) => c.text).join(" ");
                failed = out.isError === true;
              }
              if (part.state === "output-error") {
                text = part.errorText;
                failed = true;
              }
              return (
                <p
                  key={i}
                  className={`my-1 rounded px-2 py-1 text-sm ${
                    failed
                      ? "bg-red-50 text-red-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {part.toolName}: {text}
                </p>
              );
            }
            return null;
          })}
        </div>
      ))}
      
      {busy && <p className="text-slate-500">Ассистент думает…</p>}
      {error && <p className="text-red-600">{error.message}</p>}

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          sendMessage({ text: input });
          setInput("");
        }}
      >
        <input
          className="min-w-0 flex-1 rounded border border-slate-300 p-2"
          placeholder="Например: что идёт в субботу?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
        />
        <button
          className="rounded bg-indigo-600 px-4 text-white disabled:opacity-50"
          disabled={busy}
        >
          Отправить
        </button>
      </form>
    </main>
  );
}
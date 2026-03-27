"use client";

import { FormEvent, useState } from "react";
import type { ChatMessage } from "@/types/mindstress";

const quickPrompts = [
  "😮‍💨 Je me sens débordé(e) en ce moment",
  "😴 J’ai du mal à dormir",
  "💼 Le travail me met la pression",
  "👨‍👩‍👧 La famille me pèse",
  "🙏 J’ai juste besoin d’être écouté(e)",
] as const;

export default function DrMindPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function sendMessages(nextMsgs: ChatMessage[]) {
    setPending(true);
    setErr(null);
    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMsgs }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Réponse invalide");
      }
      const reply = data.text?.trim() ?? "…";
      setMessages([...nextMsgs, { role: "assistant", content: reply }]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur réseau");
    } finally {
      setPending(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || pending) return;

    const nextUser: ChatMessage = { role: "user", content: text };
    const nextMsgs = [...messages, nextUser];
    setMessages(nextMsgs);
    setInput("");
    await sendMessages(nextMsgs);
  }

  async function onQuickPrompt(text: string) {
    if (pending) return;
    const nextUser: ChatMessage = { role: "user", content: text };
    const nextMsgs = [...messages, nextUser];
    setMessages(nextMsgs);
    await sendMessages(nextMsgs);
  }

  return (
    <div className="flex min-h-[60vh] flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">
          ✨ Dr. Mind
        </h1>
        <p className="mt-2 text-sm text-[var(--ms-muted-fg)]">
          🤝 Accompagnement bienveillant, façon psychologue ivoirien d’expérience — pas un diagnostic
          médical : plutôt des pistes pour mieux respirer. Ici, tu peux te lâcher.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--ms-border)] bg-[var(--ms-calm-dim)] px-3 py-2 text-xs text-[var(--ms-fg)]">
        ⚡ <strong>Raccourci :</strong> tape un message en bas, ou clique une phrase ci-dessous pour aller plus vite.
      </div>

      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((p) => (
          <button
            key={p}
            type="button"
            disabled={pending}
            onClick={() => void onQuickPrompt(p)}
            className="rounded-full border border-[var(--ms-border)] bg-[var(--ms-elevated)] px-3 py-2 text-left text-xs font-medium text-[var(--ms-fg)] transition hover:border-[var(--ms-accent)] hover:shadow-[0_0_16px_var(--ms-glow)] disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col rounded-2xl border border-[var(--ms-border)] bg-[var(--ms-surface)] p-4">
        <div className="max-h-[420px] flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.length === 0 && (
            <p className="text-sm text-[var(--ms-muted-fg)]">
              👋 Écris ce qui pèse — en quelques mots ou plus longuement. Dr. Mind t’écoute.
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={`${i}-${m.role}`}
              className={`rounded-xl px-3 py-2 text-sm ${
                m.role === "user"
                  ? "ml-6 border border-[var(--ms-border)] bg-[var(--ms-muted)]/50 text-right"
                  : "mr-6 border border-[var(--ms-accent)]/30 bg-[var(--ms-accent)]/10"
              }`}
            >
              <span className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--ms-muted-fg)]">
                {m.role === "user" ? "🙂 Toi" : "✨ Dr. Mind"}
              </span>
              <span className="whitespace-pre-wrap">{m.content}</span>
            </div>
          ))}
        </div>

        {err && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-300">
            ⚠️ {err}
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-2">
          <input
            className="min-h-[44px] flex-1 rounded-xl border border-[var(--ms-border)] bg-[var(--ms-bg)] px-3 py-2 text-sm"
            placeholder="💬 Dis-moi ce qui se passe…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={pending}
          />
          <button
            type="submit"
            disabled={pending || !input.trim()}
            className="min-h-[44px] rounded-xl bg-[var(--ms-accent)] px-5 py-2 text-sm font-semibold text-[#fffef9] disabled:opacity-50"
          >
            {pending ? "⏳ …" : "📤 Envoyer"}
          </button>
        </form>
      </div>
    </div>
  );
}

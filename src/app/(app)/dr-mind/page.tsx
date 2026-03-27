"use client";

import {
  FormEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ChatMessage } from "@/types/mindstress";

const quickPrompts = [
  "Je me sens débordé(e) en ce moment",
  "J’ai du mal à dormir",
  "Le travail me met la pression",
  "La famille me pèse",
  "J’ai juste besoin d’être écouté(e)",
] as const;

type ThreadMessage = ChatMessage & { id: string };

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export default function DrMindPage() {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

  async function sendMessages(nextMsgs: ThreadMessage[]) {
    setPending(true);
    setErr(null);
    const payload: ChatMessage[] = nextMsgs.map(({ role, content }) => ({
      role,
      content,
    }));
    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Réponse invalide");
      }
      const reply = data.text?.trim() ?? "…";
      setMessages([
        ...nextMsgs,
        { role: "assistant", content: reply, id: makeId() },
      ]);
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

    const nextUser: ThreadMessage = {
      role: "user",
      content: text,
      id: makeId(),
    };
    const nextMsgs = [...messages, nextUser];
    setMessages(nextMsgs);
    setInput("");
    await sendMessages(nextMsgs);
  }

  async function onQuickPrompt(text: string) {
    if (pending) return;
    const nextUser: ThreadMessage = {
      role: "user",
      content: text,
      id: makeId(),
    };
    const nextMsgs = [...messages, nextUser];
    setMessages(nextMsgs);
    await sendMessages(nextMsgs);
  }

  return (
    <div className="flex min-h-[60vh] flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--ms-fg)]">
          Dr. Mind
        </h1>
        <p className="mt-2 text-sm text-[var(--ms-muted-fg)]">
          Accompagnement bienveillant, façon psychologue ivoirien d’expérience — pas un diagnostic
          médical : plutôt des pistes pour mieux respirer. Ici, tu peux te lâcher.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--ms-border)] bg-[var(--ms-calm-dim)] px-3 py-2 text-xs text-[var(--ms-fg)]">
        <strong className="font-semibold">Astuce :</strong> tape un message en bas, ou choisis une
        phrase ci-dessous pour aller plus vite.
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Phrases rapides">
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

      <section
        aria-labelledby="dr-mind-chat-title"
        className="flex flex-1 flex-col rounded-2xl border border-[var(--ms-border)] bg-[var(--ms-surface)] p-4"
      >
        <h2 id="dr-mind-chat-title" className="sr-only">
          Conversation avec Dr. Mind
        </h2>
        <div
          className="max-h-[min(420px,55vh)] flex-1 space-y-3 overflow-y-auto pr-1"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          {messages.length === 0 && (
            <p className="text-sm text-[var(--ms-muted-fg)]">
              Écris ce qui pèse — en quelques mots ou plus longuement. Dr. Mind t’écoute.
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl px-3 py-2 text-sm ${
                m.role === "user"
                  ? "ml-6 border border-[var(--ms-border)] bg-[var(--ms-muted)]/50 text-right"
                  : "mr-6 border border-[var(--ms-accent)]/30 bg-[var(--ms-accent)]/10"
              }`}
            >
              <span className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--ms-muted-fg)]">
                {m.role === "user" ? "Toi" : "Dr. Mind"}
              </span>
              <span className="whitespace-pre-wrap">{m.content}</span>
            </div>
          ))}
          {pending && (
            <p className="text-xs text-[var(--ms-muted-fg)]" aria-live="polite">
              Dr. Mind réfléchit…
            </p>
          )}
          <div ref={scrollAnchorRef} aria-hidden />
        </div>

        {err && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-300" role="alert">
            {err}
          </p>
        )}

        <form
          onSubmit={onSubmit}
          className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-2"
          aria-label="Envoyer un message à Dr. Mind"
        >
          <input
            className="min-h-[44px] flex-1 rounded-xl border border-[var(--ms-border)] bg-[var(--ms-bg)] px-3 py-2 text-sm"
            placeholder="Dis-moi ce qui se passe…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={pending}
            maxLength={4000}
            autoComplete="off"
            aria-label="Votre message"
          />
          <button
            type="submit"
            disabled={pending || !input.trim()}
            className="min-h-[44px] rounded-xl bg-[var(--ms-accent)] px-5 py-2 text-sm font-semibold text-[var(--ms-accent-fg)] transition hover:opacity-95 disabled:opacity-50"
          >
            {pending ? "…" : "Envoyer"}
          </button>
        </form>
      </section>
    </div>
  );
}

import { NextResponse } from "next/server";
import { DR_MIND_SYSTEM_PROMPT, GEMINI_MODEL } from "@/lib/dr-mind-system";

type Body = {
  messages?: { role: "user" | "assistant"; content: string }[];
};

const MAX_MESSAGES = 32;
const MAX_CHARS_PER_MESSAGE = 8000;

function sanitizeMessages(
  raw: Body["messages"]
): { role: "user" | "assistant"; content: string }[] | null {
  if (!Array.isArray(raw)) return null;
  const out: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of raw.slice(-MAX_MESSAGES)) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) continue;
    const content =
      typeof m.content === "string"
        ? m.content.slice(0, MAX_CHARS_PER_MESSAGE)
        : "";
    if (!content.trim()) continue;
    out.push({ role: m.role, content });
  }
  return out.length ? out : null;
}

/**
 * Appel REST Gemini (clé côté serveur uniquement).
 * Définir GEMINI_API_KEY dans l’environnement (Inforge / secrets).
 */
export async function POST(req: Request) {
  const json = (await req.json()) as Body;
  const messages = sanitizeMessages(json.messages);
  if (!messages) {
    return NextResponse.json(
      { error: "Aucun message valide à envoyer." },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Clé API Gemini manquante. Ajoute GEMINI_API_KEY côté serveur.",
      },
      { status: 500 }
    );
  }

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: DR_MIND_SYSTEM_PROMPT }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return NextResponse.json(
      { error: "Échec Gemini", detail: errText },
      { status: 502 }
    );
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const text =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ??
    "";

  return NextResponse.json({ text });
}

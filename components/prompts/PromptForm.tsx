"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "Escritura",
  "Arte / Imagen",
  "Código",
  "Marketing",
  "Video",
  "Productividad",
  "Otro",
];

const MODELS = [
  "ChatGPT",
  "Midjourney",
  "DALL-E",
  "Stable Diffusion",
  "Claude",
  "Gemini",
  "Otro",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .slice(0, 100);
}

export default function PromptForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [model, setModel] = useState(MODELS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("El contenido del prompt es obligatorio.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          content,
          category,
          model,
          slug: slugify(title),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "No se pudo publicar el prompt.");
        return;
      }

      const data = await res.json();
      router.push(`/prompt/${data.id}`);
      router.refresh();
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass mt-8 space-y-5 p-6 md:p-8">
      <div>
        <label className="mb-1 block text-sm font-medium text-muted">
          Título *
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Ej: Generador de historias de ciencia ficción"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-muted/60 focus:border-secondary focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-muted">
          Descripción breve
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="¿Qué hace este prompt y para quién?"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-muted/60 focus:border-secondary focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-muted">
          Contenido del prompt *
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={6}
          placeholder="Escribe aquí el prompt completo que compartirás o venderás..."
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-muted/60 focus:border-secondary focus:outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-muted">
            Categoría
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-[#1A1A2E] px-4 py-3 text-white focus:border-secondary focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-muted">
            Modelo / IA
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-[#1A1A2E] px-4 py-3 text-white focus:border-secondary focus:outline-none"
          >
            {MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-sm text-muted">
        Todos los prompts son gratis. Los apoyos de la comunidad son el motor
        del ranking de creadores. ✨
      </p>

      {error && (
        <p className="rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
        {loading ? "Publicando..." : "🚀 Publicar Prompt"}
      </button>
    </form>
  );
}

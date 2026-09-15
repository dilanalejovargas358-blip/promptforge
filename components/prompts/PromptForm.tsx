"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Rocket, Sparkles, X } from "lucide-react";

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

const MAX_TAGS = 5;

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

const inputCls =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-muted/60 focus:border-accent focus:outline-none";
const selectCls =
  "w-full rounded-xl border border-white/15 bg-card px-4 py-3 text-white focus:border-accent focus:outline-none";

export default function PromptForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [model, setModel] = useState(MODELS[0]);
  const [customModel, setCustomModel] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const value = e.currentTarget.value.trim();
    if (!value || tags.includes(value) || tags.length >= MAX_TAGS) return;
    setTags((prev) => [...prev, value]);
    e.currentTarget.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("El contenido del prompt es obligatorio.");
      return;
    }

    const finalCategory =
      category === "Otro" ? customCategory.trim() : category;
    const finalModel = model === "Otro" ? customModel.trim() : model;

    if (category === "Otro" && !finalCategory) {
      setError("Escribe el nombre de tu categoría personalizada.");
      return;
    }
    if (model === "Otro" && !finalModel) {
      setError("Escribe el nombre de tu modelo / IA personalizado.");
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
          category: finalCategory,
          model: finalModel,
          tags: JSON.stringify(tags),
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
    <form onSubmit={handleSubmit} className="glass mt-8 space-y-5 p-5 sm:p-6 md:p-8">
      <div>
        <label className="mb-1 block text-sm font-medium text-muted">
          Título *
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Ej: Generador de historias de ciencia ficción"
          className={inputCls}
        />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-sm font-medium text-muted">
            Descripción breve
          </label>
          <span
            className={`text-xs ${
              description.length > 500 ? "text-red-400" : "text-muted"
            }`}
          >
            {description.length}/500
          </span>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="¿Qué hace este prompt y para quién?"
          className={inputCls}
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
          className={inputCls}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Categoría */}
        <div>
          <label className="mb-1 block text-sm font-medium text-muted">
            Categoría
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={selectCls}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {category === "Otro" && (
            <input
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Escribe tu categoría..."
              className={`${inputCls} mt-2`}
            />
          )}
        </div>

        {/* Modelo / IA */}
        <div>
          <label className="mb-1 block text-sm font-medium text-muted">
            Modelo / IA
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className={selectCls}
          >
            {MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          {model === "Otro" && (
            <input
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
              placeholder="Escribe tu modelo / IA..."
              className={`${inputCls} mt-2`}
            />
          )}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="mb-1 block text-sm font-medium text-muted">
          Tags (opcional)
        </label>
        <div className="mb-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-white"
            >
              #{tag}
              <button
                type="button"
                onClick={() => setTags(tags.filter((t) => t !== tag))}
                className="flex items-center text-muted hover:text-white"
                aria-label={`Eliminar tag ${tag}`}
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Escribe un tag y presiona Enter"
          onKeyDown={addTag}
          disabled={tags.length >= MAX_TAGS}
          className={`${inputCls} disabled:opacity-60`}
        />
        <p className="mt-1 text-xs text-muted">
          Máximo {MAX_TAGS} tags. Presiona Enter para agregar.
        </p>
      </div>

      <p className="text-sm text-muted">
        Todos los prompts son gratis. Los apoyos de la comunidad son el motor
        del ranking de creadores.{" "}
        <Sparkles
          className="inline h-4 w-4 -translate-y-px text-accent"
          strokeWidth={2}
        />
      </p>

      {error && (
        <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
        {loading ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Publicando...
          </>
        ) : (
          <>
            <Rocket className="h-4 w-4" strokeWidth={2} />
            Publicar Prompt
          </>
        )}
      </button>
    </form>
  );
}

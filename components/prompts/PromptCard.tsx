import Link from "next/link";
import type { PromptCardData } from "@/types";
import { categoryMeta } from "@/components/ui/CategoryIcon";
import SupportPromptButton from "@/components/prompts/SupportPromptButton";
import ReportPromptButton from "@/components/prompts/ReportPromptButton";
import { Bookmark, Eye, Star, Target } from "lucide-react";

export default function PromptCard({
  prompt,
  index = 0,
}: {
  prompt: PromptCardData;
  index?: number;
}) {
  const meta = categoryMeta(prompt.category);
  const Icon = meta.icon;
  const delay = (index % 9) * 80;
  const tags = safeParseTags(prompt.tags);

  return (
    <div
      className="fade-up glass group relative flex flex-col overflow-hidden p-0 transition-all duration-300 will-change-transform hover:-translate-y-2.5 hover:border-white/20 hover:shadow-glow"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Enlace que cubre toda la tarjeta para la navegación (no anida el botón interactivo) */}
      <Link
        href={`/prompt/${prompt.id}`}
        aria-label={`Ver prompt: ${prompt.title}`}
        className="absolute inset-0 z-[2] rounded-[inherit]"
      />

      {/* Barra superior con gradiente del color de la categoría */}
      <div
        className={`h-1.5 w-full bg-gradient-to-r ${meta.bar} opacity-70 transition-opacity duration-300 group-hover:opacity-100`}
      />

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Cabecera: badge categoría + patrocinado */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${meta.bg} ${meta.color}`}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2} /> {prompt.category}
          </span>
          {prompt.isSponsored && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-secondary/15 px-2.5 py-1 text-[11px] font-black text-secondary">
              <Target className="h-3 w-3" strokeWidth={2.5} />
              PATROCINADO
            </span>
          )}
          {prompt.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-premium px-2.5 py-1 text-[11px] font-black text-background shadow">
              <Star className="h-3 w-3 fill-background" strokeWidth={2.5} />
              DESTACADO
            </span>
          )}
          <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-muted">
            {prompt.model}
          </span>
        </div>

        {/* Título + descripción */}
        <h3 className="mt-4 line-clamp-1 text-lg font-bold transition-colors group-hover:text-white">
          {prompt.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">
          {prompt.description}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] text-muted"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] text-muted">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Pie: avatar + stats */}
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">

          {/* Avatar con borde gradiente */}
          <div className="flex min-w-0 items-center gap-2">
            <span className="rounded-full bg-accent p-[2px]">
              {prompt.author.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={prompt.author.image}
                  alt={prompt.author.name ?? "Autor"}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-card text-xs font-bold text-accent">
                  {prompt.author.name?.charAt(0) ?? "?"}
                </span>
              )}
            </span>
            <span className="max-w-[100px] truncate text-xs font-medium text-muted">
              {prompt.author.name ?? "Anónimo"}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1" title="Vistas">
              <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span className="tabular-nums">{prompt.views}</span>
            </span>
            <span className="flex items-center gap-1" title="Guardados">
              <Bookmark className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span className="tabular-nums">{prompt.savesCount}</span>
            </span>
            <span
              className="flex items-center gap-1 text-accent"
              title="Créditos recibidos como apoyo"
            >
              ⚡
              <span className="tabular-nums">{prompt.totalCredits}</span>
            </span>
          </div>
        </div>

        {/* Fila de acción: reportar + apoyar (acción principal) */}
        <div className="mt-3 flex items-center justify-end gap-3">
          <div className="flex items-center gap-1">
            {/* Reportar: por encima del enlace de la tarjeta, como el apoyo */}
            <ReportPromptButton
              promptId={prompt.id}
              className="relative z-[3] rounded-full px-2.5 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-red-400"
            />
            {/* Botón de apoyo (por encima del enlace para poder pulsarlo) */}
            <SupportPromptButton
              promptId={prompt.id}
              initialCredits={prompt.totalCredits}
              className="relative z-[3]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Parsea el JSON string de Prompt.tags de forma segura (nunca lanza).
function safeParseTags(raw?: string): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}

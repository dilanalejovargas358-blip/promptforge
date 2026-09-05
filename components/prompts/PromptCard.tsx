import Link from "next/link";
import type { PromptCardData } from "@/types";
import { categoryMeta } from "@/components/ui/CategoryIcon";
import SupportPromptButton from "@/components/prompts/SupportPromptButton";

export default function PromptCard({
  prompt,
  index = 0,
}: {
  prompt: PromptCardData;
  index?: number;
}) {
  const meta = categoryMeta(prompt.category);
  const delay = (index % 9) * 80;

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

      <div className="flex flex-1 flex-col p-5">
        {/* Cabecera: badge categoría + patrocinado */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${meta.bg} ${meta.color}`}
          >
            {meta.icon} {prompt.category}
          </span>
          {prompt.isSponsored && (
            <span className="inline-flex items-center rounded-lg bg-accent/20 px-2.5 py-1 text-[11px] font-black text-accent">
              🎯 PATROCINADO
            </span>
          )}
          {prompt.isFeatured && (
            <span className="inline-flex items-center rounded-lg bg-gradient-to-r from-yellow-brand to-primary px-2.5 py-1 text-[11px] font-black text-background shadow">
              ★ DESTACADO
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

        {/* Pie: avatar + stats */}
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          {/* Avatar con borde gradiente */}
          <div className="flex min-w-0 items-center gap-2">
            <span className="rounded-full bg-gradient-to-br from-primary via-accent to-secondary p-[2px]">
              {prompt.author.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={prompt.author.image}
                  alt={prompt.author.name ?? "Autor"}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A1A2E] text-xs font-bold text-secondary">
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
              👁️
              <span className="tabular-nums">{prompt.views}</span>
            </span>
            <span className="flex items-center gap-1" title="Guardados">
              🔖
              <span className="tabular-nums">{prompt.savesCount}</span>
            </span>
            <span
              className="flex items-center gap-1 text-secondary"
              title="Créditos recibidos como apoyo"
            >
              ⚡
              <span className="tabular-nums">{prompt.totalCredits}</span>
            </span>
          </div>
        </div>

        {/* Fila de acción: todo gratis + apoyar (acción principal) */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary">
            ✦ Gratis
          </span>
          {/* Botón de apoyo (por encima del enlace para poder pulsarlo) */}
          <SupportPromptButton
            promptId={prompt.id}
            initialCredits={prompt.totalCredits}
            className="relative z-[3]"
          />
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SupportPromptButton from "@/components/prompts/SupportPromptButton";

export const revalidate = 30;

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const prompt = await prisma.prompt.findUnique({
    where: { id: params.id },
  });
  if (!prompt) return { title: "Prompt no encontrado" };
  return {
    title: prompt.title,
    description: prompt.description,
  };
}

export default async function PromptDetailPage({ params }: PageProps) {
  const prompt = await prisma.prompt.findUnique({
    where: { id: params.id },
    include: {
      author: {
        select: { name: true, image: true, bio: true },
      },
    },
  });

  if (!prompt || prompt.status !== "PUBLISHED") {
    notFound();
  }

  // Incrementa el contador de vistas
  await prisma.prompt.update({
    where: { id: prompt.id },
    data: { views: { increment: 1 } },
  });

  const tags: string[] = safeParseTags(prompt.tags);

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute -top-20 left-0 h-[300px] w-[400px] rounded-full bg-primary/15 blur-[110px]" />

      <div className="relative mx-auto max-w-4xl px-6 py-12">
        {/* Categoría + modelo */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-secondary">
            {prompt.category}
          </span>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-accent">
            {prompt.model}
          </span>
          {prompt.isFeatured && (
            <span className="rounded-full bg-gradient-to-r from-yellow-brand to-primary px-3 py-1 text-xs font-bold text-background">
              ⭐ Destacado
            </span>
          )}
        </div>

        <h1 className="mt-5 text-4xl font-extrabold md:text-5xl">
          {prompt.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted">
          <div className="flex items-center gap-2">
            {prompt.author.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={prompt.author.image}
                alt={prompt.author.name ?? "Autor"}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent text-sm font-bold text-background">
                {prompt.author.name?.charAt(0) ?? "?"}
              </span>
            )}
            <span>{prompt.author.name ?? "Anónimo"}</span>
          </div>
          <span>👁️ {prompt.views} vistas</span>
          <span>🔖 {prompt.savesCount} guardados</span>
          <span className="font-semibold text-secondary">
            ⚡ {prompt.totalCredits} apoyos
          </span>
          <span>{formatDate(prompt.createdAt)}</span>
        </div>

        {/* Cuerpo */}
        <div className="glass mt-8 p-6 md:p-8">
          <p className="whitespace-pre-wrap leading-relaxed text-white/90">
            {prompt.content}
          </p>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/5 px-3 py-1 text-xs text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Apoyar (acción principal del modelo gratuito) */}
        <div className="glass mt-8 flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
          <div>
            <div className="text-2xl font-extrabold">
              <span className="gradient-text">✦ Gratis</span>
            </div>
            <p className="text-sm text-muted">Propietario: {prompt.author.name}</p>
            <p className="mt-1 text-sm text-muted">
              ¿Te sirvió? Apoya al autor con 1 crédito para impulsarlo en el
              ranking.
            </p>
          </div>
          <SupportPromptButton
            promptId={prompt.id}
            initialCredits={prompt.totalCredits}
            className="relative"
          />
        </div>
      </div>
    </div>
  );
}

function safeParseTags(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import SupportPromptButton from "@/components/prompts/SupportPromptButton";
import ReportPromptButton from "@/components/prompts/ReportPromptButton";

// La página depende de la sesión (el autor y los admins ven los prompts en
// revisión), así que no puede servirse desde caché estática.
export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const prompt = await prisma.prompt.findUnique({
    where: { id: params.id },
    select: {
      title: true,
      description: true,
      status: true,
      moderationStatus: true,
    },
  });
  // Con los prompts retirados no se devuelve ni el título: la página responde
  // 404 y el contenido moderado no debe filtrarse por metadatos.
  if (!prompt || prompt.status !== "PUBLISHED") {
    return { title: "Prompt no encontrado" };
  }
  if (prompt.moderationStatus === "REMOVED") {
    return { title: "Prompt no encontrado" };
  }
  return {
    title: prompt.title,
    description: prompt.description,
  };
}

export default async function PromptDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  const prompt = await prisma.prompt.findUnique({
    where: { id: params.id },
    include: {
      author: {
        select: { id: true, name: true, image: true, bio: true },
      },
    },
  });

  if (!prompt || prompt.status !== "PUBLISHED") {
    notFound();
  }

  // Retirado por moderación: no existe para nadie.
  if (prompt.moderationStatus === "REMOVED") {
    notFound();
  }

  // En revisión: solo lo ven su autor y los admins, y con aviso.
  const viewer = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true },
      })
    : null;

  const isOwner = viewer?.id === prompt.author.id;
  const isAdmin = viewer?.role === "ADMIN";
  const underReview = prompt.moderationStatus === "UNDER_REVIEW";

  if (underReview && !isOwner && !isAdmin) {
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

      <div className="relative mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
        {underReview && (
          <div className="glass mb-6 rounded-2xl border border-yellow-brand/40 bg-yellow-brand/10 p-4">
            <p className="font-bold text-yellow-brand">
              ⚠️ Este prompt está en revisión
            </p>
            <p className="mt-1 text-sm text-white/85">
              {isOwner
                ? "Un administrador lo está revisando, así que no aparece en el catálogo. Te avisaremos del resultado."
                : "Un administrador lo está revisando. Solo tú y el equipo podéis verlo."}
              {prompt.moderationNote ? ` Motivo: ${prompt.moderationNote}` : ""}
            </p>
          </div>
        )}

        {/* Categoría + modelo */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
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

        <h1 className="mt-5 text-3xl font-extrabold sm:text-4xl md:text-5xl">
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
        <div className="glass mt-8 flex flex-col items-center justify-between gap-4 p-5 text-center sm:flex-row sm:p-6 sm:text-left">
          <div>
            <div className="text-2xl font-extrabold">
              <span className="gradient-text">✦ Gratis</span>
            </div>
            <p className="mt-1 text-sm text-muted">
              Propietario: {prompt.author.name}
            </p>
            <p className="mt-1 text-sm text-muted">
              ¿Te sirvió? Apoya al autor con 1 rayito para impulsarlo en el
              ranking.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <SupportPromptButton
              promptId={prompt.id}
              initialCredits={prompt.totalCredits}
              className="relative"
            />
            <ReportPromptButton promptId={prompt.id} />
          </div>
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

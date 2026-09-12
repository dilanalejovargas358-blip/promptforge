import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PromptCard from "@/components/prompts/PromptCard";
import { CATEGORY_MAP } from "@/components/ui/CategoryIcon";
import type { PromptCardData } from "@/types";

export const metadata: Metadata = {
  title: "Explorar Prompts",
  description:
    "Explora y descubre prompts profesionales para ChatGPT, Midjourney y más.",
};

export const revalidate = 30;

interface PageProps {
  searchParams: { q?: string; category?: string; authorId?: string };
}

const FEATURED_CATEGORIES = [
  "Marketing",
  "Arte / Imagen",
  "Código",
  "Escritura",
  "Productividad",
  "Video",
];

export default async function ExplorePage({ searchParams }: PageProps) {
  const query = searchParams.q?.trim() ?? "";
  const category = searchParams.category?.trim() ?? "";
  const authorId = searchParams.authorId?.trim() ?? "";

  // Nombre del creador para mostrar el contexto del filtro. Se lanza sin await
  // para que corra a la vez que la búsqueda de prompts de abajo.
  const authorPromise = authorId
    ? prisma.user.findUnique({
        where: { id: authorId },
        select: { name: true },
      })
    : Promise.resolve(null);

  const prompts = await prisma.prompt.findMany({
    where: {
      status: "PUBLISHED",
      // Fuera los retirados y los que están en revisión por moderación.
      moderationStatus: "OK",
      ...(query
        ? {
            OR: [
              { title: { contains: query } },
              { description: { contains: query } },
              { content: { contains: query } },
            ],
          }
        : {}),
      ...(category ? { category } : {}),
      ...(authorId ? { authorId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { id: true, name: true, image: true },
      },
    },
    take: 24,
  });

  const authorName = (await authorPromise)?.name ?? null;

  const mapped: PromptCardData[] = prompts.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    model: p.model,
    isFeatured: p.isFeatured,
    views: p.views,
    savesCount: p.savesCount,
    totalCredits: p.totalCredits,
    isSponsored: p.isSponsored,
    tags: p.tags,
    createdAt: p.createdAt,
    author: {
      id: p.author.id,
      name: p.author.name,
      image: p.author.image,
    },
  }));

  return (
    <div className="relative min-h-screen">
      {/* Fondo ambiental */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b from-accent/10 via-primary/5 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 py-12 md:px-6">
        {/* Encabezado */}
        <div className="fade-up text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl md:text-6xl">
            <span className="gradient-text">Explorar Prompts</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Descubre los mejores prompts curados por la comunidad, listos para
            usar en tus proyectos de IA.
          </p>
        </div>

        {/* Grid de categorías */}
        <div className="fade-up mt-12" style={{ animationDelay: "100ms" }}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <Link
              href={authorId ? `/explore?authorId=${encodeURIComponent(authorId)}` : "/explore"}
              className={`group flex flex-col items-center gap-3 rounded-2xl border p-4 text-center sm:p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow ${
                !category
                  ? "glass gradient-border border-transparent"
                  : "glass opacity-80 hover:opacity-100"
              }`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl text-white sm:h-12 sm:w-12 sm:text-2xl">
                ✨
              </span>
              <span className="text-sm font-semibold">Todos</span>
            </Link>

            {FEATURED_CATEGORIES.map((cat) => {
              const meta = CATEGORY_MAP[cat];
              const active = category === cat;
              const base = authorId
                ? `/explore?authorId=${encodeURIComponent(authorId)}`
                : "/explore";
              const sep = base.includes("?") ? "&" : "?";
              return (
                <Link
                  key={cat}
                  href={`${base}${sep}category=${encodeURIComponent(cat)}`}
                  className={`group flex flex-col items-center gap-3 rounded-2xl border p-4 text-center sm:p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow ${
                    active
                      ? `${meta.bg} border-transparent ${meta.ring}`
                      : "glass hover:border-white/20"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl sm:h-12 sm:w-12 sm:text-2xl ${meta.bg} ${meta.color} transition-transform duration-300 group-hover:scale-125`}
                  >
                    {meta.icon}
                  </span>
                  <span className="text-sm font-semibold">{cat}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Resultados */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-muted">
            {query
              ? `Resultados para “${query}”`
              : authorName
              ? `Prompts de ${authorName}`
              : "Lo más reciente"}
            <span className="ml-2 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-white">
              {mapped.length}
            </span>
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            {query && (
              <Link
                href={authorId ? `/explore?authorId=${encodeURIComponent(authorId)}` : "/explore"}
                className="text-sm font-semibold text-secondary hover:underline"
              >
                Limpiar búsqueda ✕
              </Link>
            )}
            {authorName && (
              <Link
                href="/explore"
                className="text-sm font-semibold text-secondary hover:underline"
              >
                Ver todos ✕
              </Link>
            )}
          </div>
        </div>

        {mapped.length === 0 ? (
          <div className="fade-up glass mx-auto mt-8 max-w-md p-10 text-center">
            <div className="text-4xl">🪐</div>
            <p className="mt-4 font-semibold">Sin resultados</p>
            <p className="mt-1 text-sm text-muted">
              Prueba con otra búsqueda o categoría.{" "}
              {query && (
                <span>
                  ¿O quieres{" "}
                  <Link href="/prompt/nuevo" className="text-secondary hover:underline">
                    publicar uno
                  </Link>
                  ?
                </span>
              )}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mapped.map((prompt, i) => (
              <PromptCard key={prompt.id} prompt={prompt} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

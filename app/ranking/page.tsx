import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Ranking de Creadores",
  description: "Los creadores que más créditos reciben por sus prompts en PromptForge.",
};

export const revalidate = 60;

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function RankingPage() {
  // Top creadores por créditos totales recibidos (suma de totalCredits de prompts publicados).
  const ranks = await prisma.prompt.groupBy({
    by: ["authorId"],
    where: { status: "PUBLISHED" },
    _sum: { totalCredits: true },
    _count: { _all: true },
    orderBy: { _sum: { totalCredits: "desc" } },
    take: 20,
  });

  const ids = ranks.map((r) => r.authorId);
  const authors = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, image: true },
  });
  const authorMap = new Map(authors.map((a) => [a.id, a]));

  const rows: {
    rank: number;
    author: (typeof authors)[number];
    earned: number;
    promptCount: number;
  }[] = [];
  for (let i = 0; i < ranks.length; i++) {
    const r = ranks[i];
    const author = authorMap.get(r.authorId);
    const earned = r._sum?.totalCredits ?? 0;
    if (!author || earned <= 0) continue;
    rows.push({
      rank: i + 1,
      author,
      earned,
      promptCount: r._count?._all ?? 0,
    });
  }

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b from-primary/10 via-accent/5 to-transparent" />

      <div className="relative mx-auto max-w-3xl px-4 py-12 md:px-6">
        <div className="fade-up text-center">
          <h1 className="text-4xl font-extrabold md:text-5xl">
            <span className="gradient-text">Ranking de Creadores</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-muted">
            Los creadores que más apoyos reciben de la comunidad. Apoya sus prompts
            para subirlos en el ranking.
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="fade-up glass mx-auto mt-10 max-w-md p-10 text-center text-muted">
            <div className="text-4xl">🏆</div>
            <p className="mt-3 font-semibold">
              Aún no hay apoyos registrados. ¡Sé el primero en apoyar!
            </p>
          </div>
        ) : (
          <ul className="fade-up mt-10 space-y-3" style={{ animationDelay: "100ms" }}>
            {rows.map((row) => {
              const featured = row.rank <= 3;
              return (
                <li
                  key={row.author.id}
                  className={`glass flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 hover:border-white/20 ${
                    row.rank === 1 ? "ring-1 ring-yellow-brand/40" : ""
                  }`}
                >
                  <span className="w-10 shrink-0 text-center text-2xl font-black tabular-nums">
                    {MEDALS[row.rank - 1] ?? row.rank}
                  </span>

                  <span className="rounded-full bg-gradient-to-br from-primary via-accent to-secondary p-[2px]">
                    {row.author.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={row.author.image}
                        alt={row.author.name ?? "Creador"}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1A1A2E] font-bold text-secondary">
                        {row.author.name?.charAt(0) ?? "?"}
                      </span>
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-bold">
                        {row.author.name ?? "Creador"}
                      </span>
                      {featured && (
                        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-yellow-brand to-primary px-2.5 py-0.5 text-[11px] font-black text-background shadow">
                          ★ Creador Destacado
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted">
                      {row.promptCount} prompt{row.promptCount === 1 ? "" : "s"} publicados
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-xl font-black text-secondary tabular-nums">
                      ⚡ {row.earned}
                    </div>
                    <div className="text-[11px] uppercase text-muted">
                      apoyos
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

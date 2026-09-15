import { GlowButtonLink } from "@/components/ui/GlowButton";
import AnimatedStats from "@/components/ui/AnimatedStats";
import { prisma } from "@/lib/prisma";
import { Eye, FileText, Gift, Rocket, Sparkles, Users, Zap } from "lucide-react";

// Por debajo de esta cifra de prompts publicados, los números reales darían
// pena (un "3" gigante) y es mejor contar lo que ofrece la plataforma.
const MIN_PROMPTS_FOR_STATS = 20;

// Mensajes para cuando aún no hay datos suficientes. Mismo esquema visual que
// los stats (icono / titular / pie) para que el bloque no cambie de alto.
const EARLY_ACCESS = [
  {
    icon: Rocket,
    title: "Beta abierta",
    text: "Sé de los primeros creadores",
  },
  {
    icon: Gift,
    title: "Sin comisiones",
    text: "Sube tus prompts gratis",
  },
  {
    icon: Zap,
    title: "Apoyos",
    text: "Gana visibilidad en el ranking",
  },
];

/** Cifras reales de la plataforma. Devuelve null si la BD no responde. */
async function getStats() {
  const where = { status: "PUBLISHED" };
  try {
    // En serie, no con Promise.all: DATABASE_URL usa connection_limit=1, así que
    // tres consultas lanzadas a la vez solo hacen cola en el pool (y en el build
    // llegó a agotar el timeout de 10 s → P2024). Sin paralelismo no se pierde nada.
    const promptCount = await prisma.prompt.count({ where });
    const creators = await prisma.prompt.groupBy({ by: ["authorId"], where });
    const categories = await prisma.prompt.groupBy({ by: ["category"], where });
    return {
      promptCount,
      creatorCount: creators.length,
      categoryCount: categories.length,
    };
  } catch (error) {
    // Un fallo de BD no debe tumbar la portada: se cae al mensaje de beta.
    console.error("Hero: no se pudieron leer las estadísticas", error);
    return null;
  }
}

export default async function Hero() {
  const stats = await getStats();
  const showRealStats =
    stats !== null && stats.promptCount >= MIN_PROMPTS_FOR_STATS;

  // Sin sufijo "+": son cifras exactas, no estimaciones.
  const STATS = stats
    ? [
        {
          icon: <Eye className="h-7 w-7" strokeWidth={1.75} />,
          end: stats.promptCount,
          label: "Prompts publicados",
          tint: "text-accent",
        },
        {
          icon: <Users className="h-7 w-7" strokeWidth={1.75} />,
          end: stats.creatorCount,
          label: "Creadores activos",
          tint: "text-accent",
        },
        {
          icon: <FileText className="h-7 w-7" strokeWidth={1.75} />,
          end: stats.categoryCount,
          label: "Categorías",
          tint: "text-accent",
        },
      ]
    : [];

  return (
    <section className="hero-bg relative min-h-[calc(100vh-0rem)] overflow-hidden">
      {/* Rejilla sutil */}
      <div className="grid-overlay pointer-events-none absolute inset-0" />

      {/* Orbes flotantes decorativos */}
      <div className="float-slow pointer-events-none absolute left-[8%] top-28 hidden h-3 w-3 rounded-full bg-accent shadow-glow md:block" />
      <div className="float-delayed pointer-events-none absolute right-[12%] top-40 hidden h-4 w-4 rounded-full bg-accent shadow-glow md:block" />
      <div className="float-slow pointer-events-none absolute bottom-32 left-[16%] hidden h-3 w-3 rounded-full bg-accent shadow-glow md:block" />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-4 pb-16 pt-16 text-center sm:px-6 md:pt-28">
        {/* Insignia */}
        <div className="fade-up glass flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-muted">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Nueva plataforma · beta abierta
        </div>

        {/* Título con degradado ámbar (estático) */}
        <h1 className="mt-8 text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl md:text-8xl">
          <span className="fade-up title-gradient" style={{ animationDelay: "80ms" }}>
            PromptForge
          </span>
        </h1>

        {/* Mensaje central */}
        <div className="mt-7 flex justify-center">
          <p className="fade-up max-w-3xl text-balance text-base leading-relaxed text-foreground md:text-xl">
            Dime qué quieres que haga la IA y nosotros te construimos el prompt
            perfecto
          </p>
        </div>

        {/* Botones: principal "Crear mi Prompt" (izquierda) + secundario "Explorar" (derecha) */}
        <div
          className="fade-up mt-10 flex flex-wrap items-center justify-center gap-4"
          style={{ animationDelay: "240ms" }}
        >
          <GlowButtonLink href="/prompt/nuevo" size="lg" variant="primary">
            <Sparkles className="h-5 w-5" strokeWidth={2} />
            Crear mi Prompt
          </GlowButtonLink>
          <GlowButtonLink
            href="/explore"
            size="lg"
            variant="ghost"
            className="!text-white !px-7 !py-2.5 border border-white/20 transition-colors hover:border-white/45"
          >
            Explorar Prompts
          </GlowButtonLink>
        </div>

        {/* Estadísticas dentro de una tarjeta flotante: cifras reales cuando
            hay datos suficientes, mensaje cualitativo mientras no los haya.
            El contenedor es el mismo en ambas ramas. */}
        <div className="fade-up mt-14 w-full" style={{ animationDelay: "320ms" }}>
          <div className="glass-strong gradient-border mx-auto max-w-3xl px-5 py-8 sm:px-8">
            {showRealStats ? (
              <AnimatedStats
                stats={STATS}
                className="grid grid-cols-1 gap-8 sm:grid-cols-3"
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {EARLY_ACCESS.map((b, i) => (
                  <div
                    key={b.title}
                    className="fade-up text-center"
                    style={{ animationDelay: `${i * 120 + 150}ms` }}
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
                      <b.icon className="h-7 w-7" strokeWidth={1.75} />
                    </div>
                    <div className="mt-3 text-xl font-extrabold tracking-tight text-foreground md:text-2xl">
                      {b.title}
                    </div>
                    <div className="mt-2 text-sm text-muted">{b.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

import { GlowButtonLink } from "@/components/ui/GlowButton";
import AnimatedStats from "@/components/ui/AnimatedStats";
import { Eye, FileText, Users } from "lucide-react";

// Estadísticas del hero. Valores ilustrativos; tercer dato = categorías
// (sustituye a la antigua cifra "$25K pagados", que no era realista).
const STATS = [
  {
    icon: <Eye className="h-7 w-7" strokeWidth={1.75} />,
    end: 100,
    suffix: "+",
    label: "Prompts curados",
    tint: "text-primary",
  },
  {
    icon: <Users className="h-7 w-7" strokeWidth={1.75} />,
    end: 50,
    suffix: "+",
    label: "Creadores activos",
    tint: "text-accent",
  },
  {
    icon: <FileText className="h-7 w-7" strokeWidth={1.75} />,
    end: 25,
    suffix: "+",
    label: "Categorías",
    tint: "text-secondary",
  },
];

export default function Hero() {
  return (
    <section className="hero-bg relative min-h-[calc(100vh-0rem)] overflow-hidden">
      {/* Rejilla sutil */}
      <div className="grid-overlay pointer-events-none absolute inset-0" />

      {/* Orbes flotantes decorativos */}
      <div className="float-slow pointer-events-none absolute left-[8%] top-28 hidden h-3 w-3 rounded-full bg-primary shadow-glow-primary md:block" />
      <div className="float-delayed pointer-events-none absolute right-[12%] top-40 hidden h-4 w-4 rounded-full bg-accent shadow-glow md:block" />
      <div className="float-slow pointer-events-none absolute bottom-32 left-[16%] hidden h-3 w-3 rounded-full bg-secondary shadow-glow-secondary md:block" />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 pb-16 pt-20 text-center md:pt-28">
        {/* Insignia */}
        <div className="fade-up glass flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-muted">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
          </span>
          Nueva plataforma · beta abierta
        </div>

        {/* Título con glow animado */}
        <h1 className="mt-8 text-6xl font-extrabold leading-[0.95] tracking-tight md:text-8xl">
          <span className="fade-up glow-pulse gradient-text" style={{ animationDelay: "80ms" }}>
            PromptForge
          </span>
        </h1>

        {/* Mensaje central */}
        <div className="mt-7 flex justify-center">
          <p className="fade-up max-w-3xl text-balance text-base leading-relaxed text-muted md:text-xl">
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
            ✨ Crear mi Prompt
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

        {/* Estadísticas animadas dentro de una tarjeta flotante */}
        <div className="fade-up mt-16 w-full" style={{ animationDelay: "320ms" }}>
          <div className="glass-strong gradient-border mx-auto max-w-3xl px-8 py-8">
            <AnimatedStats
              stats={STATS}
              className="grid grid-cols-1 gap-8 sm:grid-cols-3"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

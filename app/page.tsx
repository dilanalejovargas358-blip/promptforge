import type { Metadata } from "next";
import Hero from "@/components/layout/Hero";
import { GlowButtonLink } from "@/components/ui/GlowButton";

export const metadata: Metadata = {
  title: "El mercado más seguro de prompts para IA",
};

// El Hero lee cifras reales de la BD; sin esto la portada se prerenderizaría en
// el build y quedaría con los números congelados. Mismo valor que /explore.
export const revalidate = 30;

const FEATURES = [
  {
    icon: "🛡️",
    title: "Curaduría estricta",
    text: "Cada prompt pasa por revisión humana antes de publicarse. Nada de basura.",
    grad: "from-primary/20 to-primary/0",
  },
  {
    icon: "🔒",
    title: "Pagos seguros",
    text: "Sistema de créditos y pagos protegidos end-to-end para creadores y compradores.",
    grad: "from-secondary/20 to-secondary/0",
  },
  {
    icon: "🎨",
    title: "Multi-modelo",
    text: "Prompts optimizados para ChatGPT, Midjourney, Claude, DALL-E y Stable Diffusion.",
    grad: "from-accent/20 to-accent/0",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Sección de características */}
      <section className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-secondary">
            Por qué PromptForge
          </span>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl md:text-5xl">
            Construido para la <span className="gradient-text">nueva economía creativa</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="fade-up glass p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-glow"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl ${f.grad} ring-1 ring-white/10`}
              >
                {f.icon}
              </div>
              <h3 className="mt-5 text-lg font-bold sm:text-xl">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
            </div>
          ))}
        </div>

        {/* CTA final: borde glass con un tinte de acento, en lugar del
            degradado rojo→morado→turquesa. */}
        <div className="fade-up mt-12 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-[1px]">
          <div className="glass-strong relative flex flex-col items-center gap-6 overflow-hidden rounded-[calc(1.5rem-1px)] px-5 py-12 text-center sm:px-8">
            <div className="pointer-events-none absolute -top-28 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-accent/15 blur-[90px]" />

            <h3 className="relative text-2xl font-extrabold sm:text-3xl md:text-4xl">
              ¿Listo para <span className="gradient-text">forjar</span> tu primer prompt?
            </h3>
            <p className="relative max-w-xl text-muted">
              Únete hoy gratis y empieza a compartir tu talento con miles de
              creadores alrededor del mundo.
            </p>
            <div className="relative flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
              <GlowButtonLink href="/register" size="lg" variant="primary">
                Crear cuenta gratis
              </GlowButtonLink>
              <GlowButtonLink
                href="/explore"
                size="lg"
                variant="ghost"
                className="border border-white/20 !text-white transition-colors hover:border-white/45"
              >
                Ver prompts →
              </GlowButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

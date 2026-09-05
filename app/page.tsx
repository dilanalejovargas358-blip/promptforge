import type { Metadata } from "next";
import Hero from "@/components/layout/Hero";
import { GlowButtonLink } from "@/components/ui/GlowButton";

export const metadata: Metadata = {
  title: "El mercado más seguro de prompts para IA",
};

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
      <section className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-secondary">
            Por qué PromptForge
          </span>
          <h2 className="mt-3 text-3xl font-extrabold md:text-5xl">
            Construido para la <span className="gradient-text">nueva economía creativa</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
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
              <h3 className="mt-5 text-xl font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
            </div>
          ))}
        </div>

        {/* CTA final */}
        <div className="fade-up mt-12 overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-accent to-secondary p-[1.5px]">
          <div className="glass-strong flex flex-col items-center gap-6 rounded-[calc(1.5rem-1.5px)] px-8 py-12 text-center">
            <h3 className="text-3xl font-extrabold md:text-4xl">
              ¿Listo para <span className="gradient-text">forjar</span> tu primer prompt?
            </h3>
            <p className="max-w-xl text-muted">
              Únete hoy gratis y empieza a compartir tu talento con miles de
              creadores alrededor del mundo.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <GlowButtonLink href="/register" size="lg" variant="primary">
                Crear cuenta gratis
              </GlowButtonLink>
              <GlowButtonLink href="/explore" size="lg" variant="ghost">
                Ver la vitrina →
              </GlowButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

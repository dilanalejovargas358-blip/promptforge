import type { Metadata } from "next";
import Link from "next/link";
import { ChartColumn, Flame, Sparkles, Target, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "IA Tools - Edita tus prompts con IA",
  description: "Mejora, genera y analiza prompts para ChatGPT, Claude, Gemini y más.",
};

// Tooltip/config de cada tarjeta: badge + icono con gradiente.
const TOOLS = [
  {
    href: "/ia/optimizer",
    badge: { label: "Popular", icon: Flame, cls: "bg-accent/15 text-accent" },
    icon: Wrench,
    iconBg: "from-accent/20 to-accent/0",
    title: "Optimizar Prompt",
    text: "Mejora tus prompts con IA. Recibe sugerencias y ve los cambios destacados.",
  },
  {
    href: "/ia/generator",
    badge: { label: "Nuevo", icon: Sparkles, cls: "bg-secondary/15 text-secondary" },
    icon: Sparkles,
    iconBg: "from-accent/20 to-accent/0",
    title: "Generar Prompt",
    text: "Describe lo que necesitas y la IA crea un prompt profesional para ti.",
  },
  {
    href: "/ia/analyzer",
    badge: { label: "Beta", icon: ChartColumn, cls: "bg-secondary/15 text-secondary" },
    icon: ChartColumn,
    iconBg: "from-accent/20 to-accent/0",
    title: "Analizar Prompt",
    text: "Obtén una puntuación de 0 a 100 y descubre cómo mejorar tu prompt.",
  },
];

export default function IAToolsPage() {
  return (
    <div className="relative min-h-screen">
      {/* Fondo ambiental */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b from-accent/10 via-accent/5 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 py-12 md:px-6">
        {/* Encabezado */}
        <div className="fade-up text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl md:text-6xl">
            <span className="gradient-text">IA Tools</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Mejora, genera y analiza tus prompts con inteligencia artificial.
            Gratis para empezar.
          </p>
        </div>

        {/* Grid de herramientas */}
        <div
          className="fade-up mt-10 grid grid-cols-1 gap-5 md:mt-12 md:grid-cols-3 md:gap-6"
          style={{ animationDelay: "100ms" }}
        >
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group glass p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-glow sm:p-6"
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-accent ring-1 ring-white/10 ${tool.iconBg}`}
              >
                <tool.icon className="h-8 w-8" strokeWidth={1.5} />
              </div>

              {/* Badge */}
              <span
                className={`mt-5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${tool.badge.cls}`}
              >
                <tool.badge.icon className="h-3 w-3" strokeWidth={2.5} />
                {tool.badge.label}
              </span>

              <h3 className="mt-2 text-xl font-bold">{tool.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {tool.text}
              </p>

              <span className="mt-4 inline-block text-sm font-semibold text-accent group-hover:underline">
                Probar →
              </span>
            </Link>
          ))}
        </div>

        {/* CTA de créditos / límites */}
        <div className="fade-up mt-16 text-center" style={{ animationDelay: "200ms" }}>
          <div className="glass-strong inline-block rounded-2xl px-8 py-6">
            <p className="text-sm text-muted">
              <Target
                className="mr-1.5 inline h-4 w-4 -translate-y-px text-accent"
                strokeWidth={2}
              />{" "}
              <span className="font-semibold text-white">5 créditos IA gratis</span>{" "}
              al registrarte (1 por uso). ¿Necesitas más?{" "}
              <Link
                href="/profile"
                className="ml-1 font-semibold text-accent hover:underline"
              >
                Actualiza a PRO →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

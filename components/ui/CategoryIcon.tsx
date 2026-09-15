import type { LucideIcon } from "lucide-react";
import { CodeXml, Palette, PenLine, Puzzle, Target, Video, Zap } from "lucide-react";

interface CategoryMeta {
  icon: LucideIcon;
  color: string; // texto
  bg: string; // fondo glow
  ring: string; // borde hover
  bar: string; // barra de color sólido
}

// Dos acentos, alternados, en lugar de un solo color para las seis: el ámbar
// (acción) y el violeta (secundario) se reparten las categorías para que la
// rejilla no se lea como un bloque monocromo. El icono sigue siendo lo que
// distingue cada categoría. `bar` mantiene la forma de paradas de gradiente
// porque PromptCard la compone dentro de `bg-gradient-to-r`.
const AMBER = {
  color: "text-accent",
  bg: "bg-accent/15",
  ring: "hover:border-accent/60",
  bar: "from-accent to-accent",
} as const;

const VIOLET = {
  color: "text-secondary",
  bg: "bg-secondary/15",
  ring: "hover:border-secondary/60",
  bar: "from-secondary to-secondary",
} as const;

const CATEGORY_MAP: Record<string, CategoryMeta> = {
  "Arte / Imagen": { icon: Palette, ...VIOLET },
  Código: { icon: CodeXml, ...AMBER },
  Marketing: { icon: Target, ...VIOLET },
  Video: { icon: Video, ...AMBER },
  Escritura: { icon: PenLine, ...VIOLET },
  Productividad: { icon: Zap, ...AMBER },
};

const FALLBACK: CategoryMeta = {
  icon: Puzzle,
  color: "text-muted",
  bg: "bg-white/5",
  ring: "hover:border-white/30",
  bar: "from-muted to-accent",
};

export function categoryMeta(category: string): CategoryMeta {
  return CATEGORY_MAP[category] ?? FALLBACK;
}

export function CategoryIcon({
  category,
  size = "md",
}: {
  category: string;
  size?: "sm" | "md" | "lg";
}) {
  const meta = categoryMeta(category);
  const sizeClass =
    size === "lg"
      ? "h-14 w-14"
      : size === "sm"
      ? "h-8 w-8"
      : "h-11 w-11";
  const iconClass =
    size === "lg" ? "h-7 w-7" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const Icon = meta.icon;

  return (
    <span
      className={`flex items-center justify-center rounded-xl ${sizeClass} ${meta.bg} ${meta.color}`}
    >
      <Icon className={iconClass} strokeWidth={1.75} />
    </span>
  );
}

export { CATEGORY_MAP };

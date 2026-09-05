interface CategoryMeta {
  icon: string;
  color: string; // texto
  bg: string; // fondo glow
  ring: string; // borde hover
  bar: string; // barra de color sólido
}

const CATEGORY_MAP: Record<string, CategoryMeta> = {
  "Arte / Imagen": {
    icon: "🎨",
    color: "text-accent",
    bg: "bg-accent/15",
    ring: "hover:border-accent/60",
    bar: "from-accent to-[#6ec5ff]",
  },
  Código: {
    icon: "💻",
    color: "text-secondary",
    bg: "bg-secondary/15",
    ring: "hover:border-secondary/60",
    bar: "from-secondary to-[#6ec5ff]",
  },
  Marketing: {
    icon: "🎯",
    color: "text-primary",
    bg: "bg-primary/15",
    ring: "hover:border-primary/60",
    bar: "from-primary to-[#ff9a6b]",
  },
  Video: {
    icon: "🎬",
    color: "text-[#6ec5ff]",
    bg: "bg-[#6ec5ff]/15",
    ring: "hover:border-[#6ec5ff]/60",
    bar: "from-[#6ec5ff] to-secondary",
  },
  Escritura: {
    icon: "✍️",
    color: "text-yellow-brand",
    bg: "bg-yellow-brand/15",
    ring: "hover:border-yellow-brand/60",
    bar: "from-yellow-brand to-primary",
  },
  Productividad: {
    icon: "⚡",
    color: "text-secondary",
    bg: "bg-secondary/10",
    ring: "hover:border-secondary/50",
    bar: "from-secondary to-accent",
  },
};

const FALLBACK: CategoryMeta = {
  icon: "🧩",
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
      ? "h-14 w-14 text-2xl"
      : size === "sm"
      ? "h-8 w-8 text-sm"
      : "h-11 w-11 text-lg";

  return (
    <span
      className={`flex items-center justify-center rounded-xl ${sizeClass} ${meta.bg} ${meta.color}`}
    >
      {meta.icon}
    </span>
  );
}

export { CATEGORY_MAP };

import * as React from "react";

type GlassVariant = "soft" | "strong" | "gradient";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GlassVariant;
  /** Retardo de entrada en ms (para animación en cascada) */
  delay?: number;
  /** Eleva la tarjeta al hacer hover (efecto 3D) */
  lift?: boolean;
}

const variantClasses: Record<GlassVariant, string> = {
  soft: "glass",
  strong: "glass-strong",
  gradient: "glass gradient-border",
};

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function GlassCard({
  variant = "soft",
  delay = 0,
  lift = false,
  className,
  style,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        variantClasses[variant],
        lift && "transition-all duration-300 will-change-transform hover:-translate-y-2",
        "fade-up",
        className
      )}
      style={{ ...style, animationDelay: delay ? `${delay}ms` : undefined }}
      {...props}
    >
      {children}
    </div>
  );
}

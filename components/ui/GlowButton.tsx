import * as React from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 font-semibold text-muted transition-colors hover:bg-white/5 hover:text-white",
};

const sizeClasses: Record<Size, string> = {
  sm: "!px-5 !py-2 text-sm",
  md: "",
  lg: "btn-lg",
};

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function GlowButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: GlowButtonProps) {
  return (
    <button
      className={cn(variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
}

interface GlowButtonLinkProps {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

export function GlowButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: GlowButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(variantClasses[variant], sizeClasses[size], className)}
    >
      {children}
    </Link>
  );
}

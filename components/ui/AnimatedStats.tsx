"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function CountUp({
  end,
  suffix,
  prefix,
  duration = 1600,
}: {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            setValue(Math.round(end * easeOutExpo(progress)));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toLocaleString("es")}
      {suffix}
    </span>
  );
}

interface StatItem {
  icon: ReactNode; // elemento (p. ej. un icono Lucide) en lugar de un emoji
  end: number;
  suffix?: string;
  prefix?: string;
  label: string;
  tint: string;
}

export default function AnimatedStats({
  stats,
  className,
}: {
  stats: StatItem[];
  className?: string;
}) {
  return (
    <div className={className}>
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="fade-up text-center"
          style={{ animationDelay: `${i * 120 + 150}ms` }}
        >
          <div className={`text-2xl md:text-3xl ${s.tint}`}>{s.icon}</div>
          <div className="mt-2 text-3xl font-extrabold gradient-text md:text-4xl">
            <CountUp end={s.end} suffix={s.suffix} prefix={s.prefix} />
          </div>
          <div className="mt-1 text-sm text-muted">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

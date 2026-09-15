"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CreditCounter from "@/components/ui/CreditCounter";
import { RAYS_MAX } from "@/lib/constants";
import type { CreditTransaction } from "@/types";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  ClipboardList,
  Coins,
  DollarSign,
  Heart,
  Minus,
  Plus,
  Star,
  Wallet,
  Zap,
} from "lucide-react";

interface ProfileWalletProps {
  initialCredits: number;
  initialPremiumActive: boolean;
  premiumUntil: string | Date | null;
  earned: number; // créditos totales recibidos por sus prompts
}

interface WalletData {
  isPremiumActive: boolean;
  premiumUntil: string | null;
  rays: number;
  raysMax: number;
  raysNextAt: number | null;
  history: CreditTransaction[];
}

export default function ProfileWallet({
  initialCredits,
  initialPremiumActive,
  premiumUntil,
  earned,
}: ProfileWalletProps) {
  const [data, setData] = useState<WalletData>({
    isPremiumActive: initialPremiumActive,
    premiumUntil: premiumUntil ? new Date(premiumUntil).toISOString() : null,
    rays: 0,
    raysMax: RAYS_MAX,
    raysNextAt: null,
    history: [],
  });

  // Carga premium activo, rayitos e historial real desde la BD.
  useEffect(() => {
    let active = true;
    fetch("/api/credits", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!active || !d.ok) return;
        setData({
          isPremiumActive: d.isPremiumActive,
          premiumUntil: d.premiumUntil ?? null,
          rays: d.rays ?? 0,
          raysMax: d.raysMax ?? RAYS_MAX,
          raysNextAt: d.raysNextAt ?? null,
          history: d.history ?? [],
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const premium = data.isPremiumActive;
  // Icono y color de cada movimiento. Las entradas/salidas llevan el signo en
  // el propio icono (Plus/Minus), así que no hace falta texto adicional.
  const TYPE_ICON: Record<string, { Icon: LucideIcon; cls: string }> = {
    EARN: { Icon: Plus, cls: "text-success" },
    SPEND: { Icon: Minus, cls: "text-muted" },
    DONATE: { Icon: Heart, cls: "text-danger" },
    PREMIUM: { Icon: Star, cls: "text-premium" },
    RAY_EARN: { Icon: Zap, cls: "text-accent" },
    RAY_SPEND: { Icon: Zap, cls: "text-muted" },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Monedero: créditos IA + rayitos */}
        <div className="glass p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <Wallet className="h-5 w-5 text-accent" strokeWidth={1.75} />
              Tu monedero
            </h3>
            <CreditCounter
              initialCredits={initialCredits}
              className="rounded-full bg-white/5 px-3 py-1 text-sm"
            />
          </div>
          <p className="mt-1 text-sm text-muted">
            Los <span className="text-white">créditos IA</span> son para las
            herramientas de IA (1 por uso). No se regeneran solos.
          </p>

          {premium ? (
            <p className="mt-3 text-sm text-muted">
              <Star
                className="mr-1.5 inline h-4 w-4 -translate-y-px fill-premium text-premium"
                strokeWidth={2}
              />
              Premium activo: recibes 25 créditos IA cada mes.
              {data.premiumUntil && (
                <span className="mt-1 block text-xs">
                  Válido hasta{" "}
                  {new Date(data.premiumUntil).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted">
              ¿Te quedaste sin créditos? Con Premium obtienes 25 créditos IA al
              mes.
            </p>
          )}

          {/* Rayitos: moneda separada, para apoyar prompts */}
          <div className="mt-4 border-t border-white/10 pt-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">⚡ Rayitos</span>
              <span className="tabular-nums rounded-full bg-white/5 px-3 py-1 text-sm font-bold text-white">
                {data.rays}/{data.raysMax}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-muted">
              {data.rays >= data.raysMax
                ? "Al máximo. Se regeneran 1 por hora cuando gastes."
                : `Se regeneran 1 por hora. Próximo rayito ${formatNextRay(
                    data.raysNextAt
                  )}.`}{" "}
              Apoyar un prompt cuesta 1 rayito.
            </p>
          </div>

          <p className="mt-4 border-t border-white/10 pt-3 text-sm">
            <span className="text-muted">Apoyos recibidos en tus prompts:</span>{" "}
            <span className="font-bold text-accent">⚡ {earned}</span>
          </p>
        </div>

        {/* Premium */}
        <div className="glass p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <Star className="h-5 w-5 fill-premium text-premium" strokeWidth={1.75} />
              PromptForge Premium
            </h3>
            {premium && (
              <span className="rounded-full bg-premium px-3 py-1 text-xs font-black text-background">
                ACTIVO
              </span>
            )}
          </div>
          <ul className="mt-3 space-y-1.5 text-sm text-muted">
            <li className="flex items-center gap-2">
              <Coins className="h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
              25 créditos IA cada mes
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
              Insignia Premium en tu perfil
            </li>
            <li className="flex items-center gap-2 text-white">
              <DollarSign className="h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
              $1.99 / mes
            </li>
          </ul>
          {!premium && (
            <Link
              href="/profile/premium-manual"
              className="btn-secondary mt-4 block w-full text-center"
            >
              Hazte Premium — $1.99/mes
            </Link>
          )}
        </div>
      </div>

      {/* Historial de créditos */}
      <div className="glass p-5 sm:p-6">
        <h3 className="flex items-center gap-2 text-base font-bold sm:text-lg">
          <ClipboardList className="h-5 w-5 text-accent" strokeWidth={1.75} />
          Movimientos recientes
        </h3>
        {data.history.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Aún no hay movimientos. Apoya prompts para empezar.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-white/10">
            {data.history.slice(0, 8).map((t) => {
              const meta = TYPE_ICON[t.type];
              const TypeIcon = meta?.Icon ?? Minus;
              return (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0">
                      <TypeIcon
                        className={`h-4 w-4 ${meta?.cls ?? "text-muted"}`}
                        strokeWidth={2}
                      />
                    </span>
                    <span className="truncate text-muted">{t.description}</span>
                  </div>
                  <span className="shrink-0 tabular-nums font-semibold">
                    {t.type === "SPEND" || t.type === "RAY_SPEND" ? "-" : "+"}
                    {Math.abs(t.amount)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/** "en 42 min" / "en 3 h" a partir de un timestamp en ms (null si ya está al tope). */
function formatNextRay(nextAt: number | null): string {
  if (nextAt === null) return "al máximo";
  const minutes = Math.ceil(Math.max(0, nextAt - Date.now()) / 60_000);
  if (minutes <= 1) return "en menos de 1 min";
  if (minutes < 60) return `en ${minutes} min`;
  return `en ${Math.ceil(minutes / 60)} h`;
}

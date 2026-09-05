"use client";

import { useEffect, useState } from "react";
import CreditCounter from "@/components/ui/CreditCounter";
import AdModal from "@/components/modals/AdModal";
import type { CreditTransaction } from "@/types";

interface ProfileWalletProps {
  initialCredits: number;
  initialPremiumActive: boolean;
  premiumUntil: string | Date | null;
  earned: number; // créditos totales recibidos por sus prompts
}

interface WalletData {
  isPremiumActive: boolean;
  premiumUntil: string | null;
  canWatchAd: boolean;
  cooldownRemaining: number;
  history: CreditTransaction[];
}

export default function ProfileWallet({
  initialCredits,
  initialPremiumActive,
  premiumUntil,
  earned,
}: ProfileWalletProps) {
  const [refresh, setRefresh] = useState(0);
  const [adOpen, setAdOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [data, setData] = useState<WalletData>({
    isPremiumActive: initialPremiumActive,
    premiumUntil: premiumUntil ? new Date(premiumUntil).toISOString() : null,
    canWatchAd: true,
    cooldownRemaining: 0,
    history: [],
  });

  // Carga premium activo + historial real desde la BD.
  useEffect(() => {
    let active = true;
    fetch("/api/credits", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!active || !d.ok) return;
        setData({
          isPremiumActive: d.isPremiumActive,
          premiumUntil: d.premiumUntil ?? null,
          canWatchAd: d.canWatchAd,
          cooldownRemaining: d.cooldownRemaining ?? 0,
          history: d.history ?? [],
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [refresh]);

  async function startUpgrade() {
    setUpgradeError(null);
    setUpgrading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const d = await res.json();
      if (res.ok && d.url) {
        window.location.href = d.url;
        return;
      }
      setUpgradeError(d?.error ?? "No se pudo iniciar el pago.");
    } catch {
      setUpgradeError("Error de conexión.");
    } finally {
      setUpgrading(false);
    }
  }

  const premium = data.isPremiumActive;
  const typeIcon: Record<string, string> = {
    EARN: "➕",
    SPEND: "➖",
    DONATE: "❤️",
    PREMIUM: "⭐",
  };

  return (
    <div className="space-y-4">
      <AdModal
        open={adOpen}
        onClose={() => setAdOpen(false)}
        onCredited={() => setRefresh((r) => r + 1)}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {/* Monedero / ganar créditos */}
        <div className="glass p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">💰 Tu monedero</h3>
            <CreditCounter
              initialCredits={initialCredits}
              refreshKey={refresh}
              className="rounded-full bg-white/5 px-3 py-1 text-sm"
            />
          </div>
          {premium ? (
            <p className="mt-2 text-sm text-muted">
              ⭐ Premium activo. No necesitas ver anuncios y recibes +5 créditos/día.
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
            <>
              <p className="mt-1 text-sm text-muted">
                Gana créditos viendo anuncios y úsalos para apoyar a los creadores.
              </p>
              <button
                type="button"
                onClick={() => setAdOpen(true)}
                disabled={!data.canWatchAd}
                className="btn-primary mt-4 w-full shadow-glow-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {data.cooldownRemaining > 0
                  ? `Disponible en ${Math.ceil(data.cooldownRemaining / 1000)}s`
                  : "📺 Ver anuncio (+1 crédito)"}
              </button>
            </>
          )}
          <p className="mt-4 border-t border-white/10 pt-3 text-sm">
            <span className="text-muted">Créditos recibidos por tus prompts:</span>{" "}
            <span className="font-bold text-secondary">⚡ {earned}</span>
          </p>
        </div>

        {/* Premium */}
        <div className="glass p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">⭐ PromptForge Premium</h3>
            {premium && (
              <span className="rounded-full bg-gradient-to-r from-yellow-brand to-primary px-3 py-1 text-xs font-black text-background">
                ACTIVO
              </span>
            )}
          </div>
          <ul className="mt-3 space-y-1.5 text-sm text-muted">
            <li>🚫 Sin anuncios</li>
            <li>♾️ Apoya sin límite de créditos</li>
            <li>➕ +5 créditos al día</li>
            <li className="text-white">💵 $1.99 / mes</li>
          </ul>
          {!premium && (
            <>
              <button
                type="button"
                onClick={startUpgrade}
                disabled={upgrading}
                className="btn-secondary mt-4 w-full disabled:opacity-50"
              >
                {upgrading ? "Redirigiendo a Stripe…" : "Hazte Premium — $1.99/mes"}
              </button>
              {upgradeError && <p className="mt-3 text-xs text-red-400">{upgradeError}</p>}
            </>
          )}
        </div>
      </div>

      {/* Historial de créditos */}
      <div className="glass p-6">
        <h3 className="text-lg font-bold">📒 Movimientos recientes</h3>
        {data.history.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Aún no hay movimientos. Ve un anuncio o apoya prompts para empezar.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-white/10">
            {data.history.slice(0, 8).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="shrink-0 text-base">{typeIcon[t.type] ?? "•"}</span>
                  <span className="truncate text-muted">{t.description}</span>
                </div>
                <span className="shrink-0 tabular-nums font-semibold">
                  {t.type === "SPEND" ? "-" : "+"}
                  {t.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

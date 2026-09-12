"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Tipo de cambio fijo: el precio se cobra en bolivianos por YOLO Pago, así que
// el monto es el que ve el usuario y no debe bailar entre visitas.
const EXCHANGE_RATE = 9.15; // Bs por USD
const PRICE_USD = 1.99;
const TOTAL_BS = Math.ceil(PRICE_USD * EXCHANGE_RATE); // 19 Bs

// La verificación es manual: la espera da 15 minutos de margen antes de derivar
// a soporte, y el sondeo busca la aprobación sin que el usuario recargue.
const WAIT_SECONDS = 15 * 60;
const POLL_MS = 10_000;
const REDIRECT_MS = 3_000;

interface Props {
  isPremium: boolean;
  hasPending: boolean;
}

// form → waiting → approved | rejected
type View = "form" | "waiting" | "approved" | "rejected";

export default function PremiumManualOptions({ isPremium, hasPending }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>("yolo");
  const [view, setView] = useState<View>(hasPending ? "waiting" : "form");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejection, setRejection] = useState<string | null>(null);

  // Instante en que arrancó la espera. Se siembra con "ahora" y el primer sondeo
  // lo corrige con el createdAt real: si el usuario recarga a los 10 minutos, el
  // contador retoma en 05:00 en lugar de reiniciar en 15:00.
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [remaining, setRemaining] = useState(WAIT_SECONDS);

  async function requestActivation() {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/premium/request", { method: "POST" });
      const d = await res.json().catch(() => null);
      if (!res.ok) {
        setError(d?.error ?? "No se pudo registrar la solicitud.");
        return;
      }
      // El POST ya devuelve la solicitud: el contador arranca con su hora real
      // sin esperar al primer sondeo.
      if (d?.request?.createdAt) {
        setStartedAt(new Date(d.request.createdAt).getTime());
      }
      setView("waiting");
    } catch {
      setError("Error de conexión.");
    } finally {
      setSending(false);
    }
  }

  // Sondeo del estado. Al detectar APPROVED o REJECTED, `view` cambia y el
  // cleanup corta el intervalo: el sondeo se detiene solo.
  useEffect(() => {
    if (view !== "waiting") return;

    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/premium/request/status", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const d = await res.json();
        if (cancelled) return;

        if (d?.createdAt) setStartedAt(new Date(d.createdAt).getTime());

        if (d?.status === "APPROVED") {
          setView("approved");
        } else if (d?.status === "REJECTED") {
          setRejection(d.rejectionReason ?? null);
          setView("rejected");
        }
      } catch {
        // Un fallo de red no tumba la pantalla: se reintenta al siguiente tick.
        // La solicitud sigue PENDING en el servidor, no se pierde nada.
      }
    }

    check();
    const id = setInterval(check, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [view]);

  // Cuenta atrás. Al llegar a 0 se queda clavada en 00:00 a propósito: no
  // cancela la solicitud ni detiene el sondeo, solo añade el aviso de soporte.
  useEffect(() => {
    if (view !== "waiting") return;

    function tick() {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setRemaining(Math.max(0, WAIT_SECONDS - elapsed));
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [view, startedAt]);

  // Confirmación vista: de vuelta al perfil. El refresh hace falta porque los
  // créditos ya cambiaron en el servidor y la caché del router los tiene viejos.
  useEffect(() => {
    if (view !== "approved") return;
    const id = setTimeout(() => {
      router.push("/profile");
      router.refresh();
    }, REDIRECT_MS);
    return () => clearTimeout(id);
  }, [view, router]);

  if (view === "approved") {
    return (
      <Shell>
        <div className="glass w-full p-10 text-center">
          <div className="scale-in mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-secondary bg-secondary/15 text-5xl leading-none text-secondary">
            ✓
          </div>
          <h1 className="fade-in-delayed mt-6 text-3xl font-extrabold">
            ¡Premium activado!
          </h1>
          <p className="fade-in-delayed mt-2 text-muted">
            +25 créditos IA añadidos a tu cuenta
          </p>
          <p className="mt-8 text-xs text-muted">Llevándote a tu perfil…</p>
        </div>
      </Shell>
    );
  }

  if (view === "waiting") {
    const expired = remaining === 0;
    return (
      <Shell>
        <div className="glass w-full p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-brand/15 text-3xl">
            ⏳
          </div>
          <h1 className="mt-5 text-2xl font-extrabold">
            Estamos verificando tu pago
          </h1>
          <p className="mt-2 text-sm text-muted">
            Esto puede tardar hasta 15 minutos.
          </p>

          <p
            className={`mt-6 text-5xl font-extrabold tabular-nums ${
              expired ? "text-muted" : "gradient-text"
            }`}
          >
            {formatClock(remaining)}
          </p>

          {expired ? (
            <p className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted">
              Si ya pasaron más de 15 minutos y no se activa, escríbenos a{" "}
              <a
                href="mailto:soporte@promptforge.com"
                className="font-semibold text-secondary"
              >
                soporte@promptforge.com
              </a>
            </p>
          ) : (
            <p className="mt-4 text-xs text-muted">
              Puedes dejar esta pestaña abierta: se activa sola en cuanto
              confirmemos el pago.
            </p>
          )}

          <Link
            href="/profile"
            className="mt-6 inline-block text-sm text-muted transition-colors hover:text-white"
          >
            Volver al perfil
          </Link>
        </div>
      </Shell>
    );
  }

  if (view === "rejected") {
    return (
      <Shell>
        <div className="glass w-full p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 text-3xl">
            ❌
          </div>
          <h1 className="mt-5 text-2xl font-extrabold">
            No pudimos activar tu Premium
          </h1>
          {rejection && (
            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {rejection}
            </p>
          )}
          <Link href="/profile" className="btn-primary mt-6">
            Volver al perfil
          </Link>
        </div>
      </Shell>
    );
  }

  const methods = [
    {
      id: "yolo",
      icon: "🇧🇴",
      name: "Pago por QR - Bolivia",
      note: `${TOTAL_BS} Bs · disponible ahora`,
      enabled: true,
    },
    {
      id: "visa",
      icon: "💳",
      name: "Visa internacional (Meru)",
      note: "Pago con tarjeta desde el exterior",
      enabled: false,
    },
    {
      id: "cripto",
      icon: "₿",
      name: "Cripto (Binance)",
      note: "Pago con criptomonedas",
      enabled: false,
    },
  ];

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b from-secondary/10 via-accent/5 to-transparent" />

      <div className="relative mx-auto max-w-2xl px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold">
            <span className="gradient-text">💎 Hazte Premium</span>
          </h1>
          <p className="mt-3 text-muted">
            ${PRICE_USD}/mes · {TOTAL_BS} Bs al tipo de cambio de{" "}
            {EXCHANGE_RATE.toFixed(2)} Bs/USD
          </p>
        </div>

        {isPremium && (
          <div className="mt-8 rounded-2xl border border-secondary/40 bg-secondary/10 p-4 text-center text-sm font-semibold text-secondary">
            ⭐ Ya eres Premium. No necesitas hacer nada más.
          </div>
        )}

        {/* Métodos de pago */}
        <div className="mt-8 space-y-3">
          {methods.map((m) => {
            const isOpen = m.enabled && open === m.id;
            return (
              <div key={m.id} className="glass overflow-hidden">
                <button
                  type="button"
                  disabled={!m.enabled}
                  onClick={() => setOpen(isOpen ? null : m.id)}
                  className={`flex w-full items-center justify-between gap-4 p-4 text-left transition-colors ${
                    m.enabled ? "hover:bg-white/5" : "cursor-not-allowed opacity-50"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">{m.icon}</span>
                    <span>
                      <span className="block font-bold">{m.name}</span>
                      <span className="block text-xs text-muted">{m.note}</span>
                    </span>
                  </span>
                  {m.enabled ? (
                    <span className="shrink-0 text-xs text-muted">
                      {isOpen ? "▲" : "▼"}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-muted">
                      Próximamente
                    </span>
                  )}
                </button>

                {isOpen && (
                  <div className="border-t border-white/10 p-5">
                    <div className="flex flex-col items-center gap-4 rounded-2xl bg-white/5 p-6">
                      <p className="text-sm text-muted">
                        Escanea este QR con la app de YOLO Pago
                      </p>
                      <div className="relative h-56 w-56 overflow-hidden rounded-xl border-2 border-white/20">
                        <Image
                          src="/images/yolo-qr-promptforge.png"
                          alt="QR de YOLO Pago para pagar PromptForge Premium"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <p className="text-center text-sm font-medium text-white">
                        Monto a pagar:{" "}
                        <span className="gradient-text font-bold">
                          {TOTAL_BS} Bs
                        </span>
                      </p>
                    </div>

                    <ol className="mt-5 list-inside list-decimal space-y-1 text-sm text-muted">
                      <li>Abre la app de YOLO Pago</li>
                      <li>Escanea el QR de arriba</li>
                      <li>
                        Verifica que el monto sea{" "}
                        <strong className="text-white">{TOTAL_BS} Bs</strong>
                      </li>
                      <li>Confirma el pago con tu PIN</li>
                      <li>Pulsa el botón de abajo para avisarnos</li>
                    </ol>

                    <button
                      type="button"
                      onClick={requestActivation}
                      disabled={sending || isPremium}
                      className="btn-primary mt-5 w-full disabled:opacity-50"
                    >
                      {sending ? "Enviando…" : "✅ Ya pagué, activar Premium"}
                    </button>

                    {error && (
                      <p className="mt-3 text-center text-xs text-red-400">
                        {error}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Beneficios Premium */}
        <div className="glass mt-6 p-6">
          <h3 className="text-lg font-bold text-secondary">✨ Beneficios Premium</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              ✅ <span className="text-white">25 créditos IA</span> cada mes
            </li>
            <li>
              ✅ <span className="text-white">Insignia</span> de creador Premium
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Envoltorio de las pantallas de espera/resultado: repite el fondo de la página
// para que el cambio de vista no se note como un salto.
function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b from-secondary/10 via-accent/5 to-transparent" />
      <div className="relative mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  );
}

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

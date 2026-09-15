"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Config {
  usdToBobRate: number;
  premiumPriceUsd: number;
  qrImageUrl: string;
}

export default function ConfigForm({ initial }: { initial: Config }) {
  const router = useRouter();
  const [rate, setRate] = useState(String(initial.usdToBobRate));
  const [price, setPrice] = useState(String(initial.premiumPriceUsd));
  const [qrUrl, setQrUrl] = useState(initial.qrImageUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // Se acepta coma decimal: en Bolivia se escribe 9,15.
  const parseDecimal = (v: string) => Number(v.trim().replace(",", "."));

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    setOk(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload-qr", { method: "POST", body });
      const d = await res.json().catch(() => null);
      if (!res.ok) {
        setError(d?.error ?? "No se pudo subir la imagen.");
        return;
      }
      // Solo se previsualiza: el cambio no es real hasta que se guarde.
      setQrUrl(d.url);
      setOk("Imagen subida. Pulsa «Guardar cambios» para aplicarla.");
    } catch {
      setError("Error de conexión.");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    const rateNum = parseDecimal(rate);
    const priceNum = parseDecimal(price);

    if (!Number.isFinite(rateNum) || rateNum <= 0) {
      setError("El tipo de cambio debe ser un número mayor que 0.");
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError("El precio debe ser un número mayor que 0.");
      return;
    }

    setSaving(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/admin/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usdToBobRate: rateNum,
          premiumPriceUsd: priceNum,
          qrImageUrl: qrUrl,
        }),
      });
      const d = await res.json().catch(() => null);
      if (!res.ok) {
        setError(d?.error ?? "No se pudo guardar.");
        return;
      }
      // Se re-sincroniza con lo que devolvió el servidor, no con lo tecleado.
      setRate(String(d.usdToBobRate));
      setPrice(String(d.premiumPriceUsd));
      setQrUrl(d.qrImageUrl);
      setOk(
        `Guardado. El total en Bs queda en ${Math.ceil(
          d.premiumPriceUsd * d.usdToBobRate
        )} Bs.`
      );
      router.refresh();
    } catch {
      setError("Error de conexión.");
    } finally {
      setSaving(false);
    }
  }

  // Vista previa del total: mismo redondeo que aplica el servidor.
  const totalBs = (() => {
    const r = parseDecimal(rate);
    const p = parseDecimal(price);
    if (!Number.isFinite(r) || !Number.isFinite(p) || r <= 0 || p <= 0) {
      return null;
    }
    return Math.ceil(p * r);
  })();

  const field =
    "mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-muted/60 focus:border-accent focus:outline-none";

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold">Precio Premium (USD)</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={field}
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">
            Tipo de cambio (Bs por USD)
          </span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className={field}
          />
        </label>
      </div>

      <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted">
        Total que verá el usuario:{" "}
        <strong className="text-white">
          {totalBs === null ? "—" : `${totalBs} Bs`}
        </strong>{" "}
        (redondeado hacia arriba)
      </p>

      <div>
        <span className="text-sm font-semibold">Imagen del QR</span>
        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl border-2 border-white/20 bg-white/5">
            <Image
              src={qrUrl}
              alt="QR de pago actual"
              fill
              className="object-contain"
            />
          </div>

          <div className="min-w-0">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                // Se limpia para que volver a elegir el mismo archivo re-dispare.
                e.target.value = "";
              }}
              className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/20"
            />
            <p className="mt-2 text-xs text-muted">
              PNG, JPG o WebP. Máximo 5 MB. Se sube sola; después pulsa «Guardar
              cambios» para aplicarla.
            </p>
            {uploading && (
              <p className="mt-2 text-xs font-semibold text-accent">
                Subiendo…
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </p>
      )}
      {ok && (
        <p className="rounded-xl border border-accent/30 bg-accent/10 p-3 text-sm text-accent">
          {ok}
        </p>
      )}

      <button
        type="button"
        onClick={save}
        disabled={saving || uploading}
        className="btn-primary disabled:opacity-50"
      >
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function PremiumManualPage() {
  const { data: session } = useSession();
  const [exchangeRate, setExchangeRate] = useState(12.64);
  
  // Monto en Bs
  const priceUSD = 1.99;
  const totalBOB = (priceUSD * exchangeRate).toFixed(2);
  const totalBOBRounded = Math.ceil(parseFloat(totalBOB));

  useEffect(() => {
    // Obtener tipo de cambio actualizado
    fetch("https://api.exchangerate-api.com/v4/latest/USD")
      .then(res => res.json())
      .then(data => {
        if (data.rates?.BOB) {
          setExchangeRate(data.rates.BOB);
        }
      })
      .catch(() => console.log("Usando tipo de cambio por defecto"));
  }, []);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass p-8 text-center">
          <p className="text-muted">Debes iniciar sesión para acceder a Premium</p>
          <a href="/login" className="btn-primary mt-4 inline-block">
            Iniciar sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b from-secondary/10 via-accent/5 to-transparent" />

      <div className="relative mx-auto max-w-2xl px-4 py-12">
        {/* Encabezado */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold">
            <span className="gradient-text">💎 PromptForge Premium</span>
          </h1>
          <p className="mt-3 text-muted">
            Paga con YOLO Pago y disfruta de todos los beneficios Premium.
          </p>
        </div>

        {/* Tarjeta de pago */}
        <div className="glass mt-8 p-8">
          <h2 className="text-2xl font-bold">Resumen del pago</h2>

          <div className="mt-6 space-y-3 text-muted">
            <div className="flex justify-between">
              <span>Precio Premium (USD)</span>
              <span className="text-white">${priceUSD}</span>
            </div>
            <div className="flex justify-between">
              <span>Tipo de cambio (USD → Bs)</span>
              <span className="text-white">{exchangeRate.toFixed(2)} Bs</span>
            </div>
            <div className="border-t border-white/10 pt-3">
              <div className="flex justify-between text-xl font-bold">
                <span>Total a pagar</span>
                <span className="gradient-text">{totalBOBRounded} Bs</span>
              </div>
            </div>
          </div>

          {/* QR de YOLO Pago */}
          <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl bg-white/5 p-6">
            <p className="text-sm text-muted">Escanea este QR con YOLO Pago</p>
            
            <div className="relative h-48 w-48 overflow-hidden rounded-xl border-2 border-white/20">
              <Image
                src="/images/yolo-qr-promptforge.png"
                alt="QR YOLO Pago - PromptForge Premium"
                fill
                className="object-contain"
              />
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-white">
                Monto a pagar: <span className="gradient-text font-bold">{totalBOBRounded} Bs</span>
              </p>
              <p className="text-xs text-muted mt-1">
                (Incluye el tipo de cambio actual de {exchangeRate.toFixed(2)} Bs/USD)
              </p>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-secondary">📋 Instrucciones</p>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-muted">
              <li>Abre la app de <strong className="text-white">YOLO Pago</strong></li>
              <li>Escanea el <strong className="text-white">QR</strong> de arriba</li>
              <li>Verifica que el monto sea <strong className="text-white">{totalBOBRounded} Bs</strong></li>
              <li>Confirma el pago con tu PIN</li>
              <li>Envía el comprobante a <strong className="text-secondary">soporte@promptforge.com</strong></li>
              <li>¡Te activamos Premium en máximo <strong className="text-white">24 horas</strong>!</li>
            </ol>
          </div>

          {/* Botón de solicitud manual */}
          <button
            onClick={() => {
              const mensaje = encodeURIComponent(
                `Hola, quiero activar Premium en PromptForge Pro.\n\n` +
                `Mi email: ${session.user.email}\n` +
                `Monto pagado: ${totalBOBRounded} Bs (YOLO Pago)\n` +
                `Adjunto el comprobante de pago.`
              );
              window.open(`mailto:soporte@promptforge.com?subject=Premium%20PromptForge&body=${mensaje}`);
            }}
            className="btn-primary mt-6 w-full"
          >
            📧 Enviar comprobante por correo
          </button>

          <p className="mt-4 text-center text-xs text-muted">
            Después de enviar el comprobante, recibirás la confirmación por correo.
          </p>
        </div>

        {/* Beneficios Premium */}
        <div className="glass mt-6 p-6">
          <h3 className="text-lg font-bold text-secondary">✨ Beneficios Premium</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>✅ <span className="text-white">25 créditos IA</span> cada mes</li>
            <li>✅ <span className="text-white">Insignia</span> de creador Premium</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
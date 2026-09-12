// Esqueleto del formulario de configuración: dos campos, el aviso del total, la
// previsualización del QR y el botón.
export default function Loading() {
  return (
    <div className="glass animate-pulse p-5 sm:p-6">
      <div className="h-5 w-56 rounded bg-white/10" />
      <div className="mt-2 h-3 w-80 rounded bg-white/5" />

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="h-16 rounded-xl bg-white/5" />
        <div className="h-16 rounded-xl bg-white/5" />
      </div>

      <div className="mt-6 h-14 rounded-xl bg-white/5" />

      <div className="mt-6 h-40 w-40 rounded-xl bg-white/5" />

      <div className="mt-6 h-11 w-40 rounded-full bg-white/10" />
    </div>
  );
}

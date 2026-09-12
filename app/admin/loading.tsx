// Esqueleto del índice del panel. Imita la rejilla de tarjetas para que el
// cambio a contenido real no se sienta como un salto.
export default function Loading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="glass animate-pulse p-6">
          <div className="h-5 w-32 rounded bg-white/10" />
          <div className="mt-3 h-3 w-48 rounded bg-white/5" />
          <div className="mt-5 h-4 w-16 rounded bg-white/5" />
        </div>
      ))}
    </div>
  );
}

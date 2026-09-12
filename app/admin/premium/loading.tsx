// Esqueleto de la cola de solicitudes Premium.
export default function Loading() {
  return (
    <div className="glass animate-pulse p-5 sm:p-6">
      <div className="h-5 w-48 rounded bg-white/10" />
      <div className="mt-2 h-3 w-72 rounded bg-white/5" />

      <ul className="mt-6 divide-y divide-white/10">
        {Array.from({ length: 3 }).map((_, i) => (
          <li
            key={i}
            className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="space-y-2">
              <div className="h-4 w-40 rounded bg-white/10" />
              <div className="h-3 w-64 rounded bg-white/5" />
            </div>
            <div className="h-8 w-40 shrink-0 rounded-lg bg-white/5" />
          </li>
        ))}
      </ul>
    </div>
  );
}

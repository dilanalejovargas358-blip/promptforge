// Esqueleto del perfil: cabecera con avatar, tres estadísticas, el monedero y la
// lista de prompts.
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl animate-pulse px-4 py-12 sm:px-6">
      <div className="glass p-6 text-center sm:p-8">
        <div className="mx-auto h-20 w-20 rounded-full bg-white/10 sm:h-24 sm:w-24" />
        <div className="mx-auto mt-4 h-7 w-44 rounded bg-white/10" />
        <div className="mx-auto mt-3 h-3 w-56 rounded bg-white/5" />
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <div className="h-8 w-32 rounded-full bg-white/5" />
          <div className="h-8 w-28 rounded-full bg-white/5" />
          <div className="h-8 w-24 rounded-full bg-white/5" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass h-20" />
        ))}
      </div>

      <div className="mt-6 h-32 rounded-2xl bg-white/5" />

      <div className="mt-10 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass h-16" />
        ))}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileWallet from "@/components/profile/ProfileWallet";
import NotificationBanner from "@/components/ui/NotificationBanner";
import { authorEarnedCredits, isPremiumActive } from "@/lib/credits";
import { RAYS_MAX } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Mi Perfil",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // En paralelo: el agregado solo necesita el id, que ya viene en el token, así
  // que no tiene por qué esperar a que resuelva la búsqueda del usuario.
  const [user, earned] = await Promise.all([
    prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        prompts: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    }),
    authorEarnedCredits(session.user.id),
  ]);

  if (!user) {
    redirect("/login");
  }
  const premiumActive = isPremiumActive(user);
  // Esta página lee el usuario directo de Prisma (sin pasar por
  // applyRaysRegen), así que el tope se aplica aquí para no mostrar saldos
  // heredados por encima de RAYS_MAX.
  const rays = Math.min(user.rays, RAYS_MAX);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      {/* Avisos de moderación sobre tus prompts (no leídos) */}
      <NotificationBanner />

      {/* Cabecera del perfil */}
      <div className="glass p-6 text-center sm:p-8">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={user.name ?? "Usuario"}
            className="mx-auto h-20 w-20 rounded-full object-cover ring-4 ring-secondary/40 sm:h-24 sm:w-24"
          />
        ) : (
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent text-3xl font-black text-background sm:h-24 sm:w-24 sm:text-4xl">
            {user.name?.charAt(0) ?? user.email.charAt(0).toUpperCase()}
          </span>
        )}
        <h1 className="mt-4 text-3xl font-extrabold">{user.name ?? "Usuario"}</h1>
        <p className="text-muted">{user.email}</p>
        <p className="mt-0.5 text-xs text-muted">
          Miembro desde{" "}
          {new Date(user.createdAt).toLocaleDateString("es", {
            month: "long",
            year: "numeric",
          })}
        </p>
        <p className="mt-2 text-sm text-muted">{user.bio ?? "Sin biografía aún."}</p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <span className="glass rounded-full px-4 py-1.5 text-sm">
            💳 {user.credits} créditos IA
          </span>
          <span className="glass rounded-full px-4 py-1.5 text-sm">
            ⚡ {rays}/{RAYS_MAX} rayitos
          </span>
          {premiumActive ? (
            <span className="rounded-full bg-gradient-to-r from-yellow-brand to-primary px-4 py-1.5 text-xs font-bold text-background shadow-glow-primary">
              ⭐ Premium
            </span>
          ) : (
            <span className="rounded-full bg-white/5 px-4 py-1.5 text-xs text-muted">
              👤 {user.role === "ADMIN" ? "Administrador" : "Miembro"}
            </span>
          )}
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
        <div className="glass p-3 text-center sm:p-4">
          <div className="text-xl font-bold text-secondary sm:text-2xl">
            {user.prompts.length}
          </div>
          <div className="text-xs text-muted">Prompts</div>
        </div>
        <div className="glass p-3 text-center sm:p-4">
          <div className="text-xl font-bold text-yellow-brand sm:text-2xl">
            {rays}
          </div>
          <div className="text-xs text-muted">Rayitos</div>
        </div>
        <div className="glass p-3 text-center sm:p-4">
          <div className="text-xl font-bold text-accent sm:text-2xl">
            {earned}
          </div>
          <div className="text-xs text-muted">Apoyos recibidos</div>
        </div>
      </div>

      {/* Monedero de créditos + Premium */}
      <div className="mt-6">
        <ProfileWallet
          initialCredits={user.credits}
          initialPremiumActive={premiumActive}
          premiumUntil={user.premiumUntil}
          earned={earned}
        />
      </div>

      {/* Lista de prompts */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold sm:text-2xl">
            Mis Prompts ({user.prompts.length})
          </h2>
          <Link href="/prompt/nuevo" className="btn-primary shrink-0 !px-5 !py-2 text-sm">
            + Nuevo
          </Link>
        </div>

        {user.prompts.length === 0 ? (
          <div className="glass p-10 text-center text-muted">
            Aún no has subido ningún prompt. ¡Crea el primero!
          </div>
        ) : (
          <ul className="space-y-3">
            {user.prompts.map((prompt) => (
              <li key={prompt.id}>
                <Link
                  href={`/prompt/${prompt.id}`}
                  className="glass flex items-center justify-between gap-3 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-secondary/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{prompt.title}</div>
                    <div className="text-xs text-muted">
                      {prompt.category} · {prompt.model}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/5 px-3 py-1 text-xs uppercase text-muted">
                    {prompt.status.toLowerCase()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

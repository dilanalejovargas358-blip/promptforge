import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileWallet from "@/components/profile/ProfileWallet";
import { authorEarnedCredits, isPremiumActive } from "@/lib/credits";

export const metadata: Metadata = {
  title: "Mi Perfil",
};

interface ProfilePageProps {
  searchParams?: { upgrade?: string };
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      prompts: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const earned = await authorEarnedCredits(user.id);
  const premiumActive = isPremiumActive(user);
  const upgrade = searchParams?.upgrade;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Cabecera del perfil */}
      <div className="glass p-8 text-center">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={user.name ?? "Usuario"}
            className="mx-auto h-24 w-24 rounded-full object-cover ring-4 ring-secondary/40"
          />
        ) : (
          <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent text-4xl font-black text-background">
            {user.name?.charAt(0) ?? user.email.charAt(0).toUpperCase()}
          </span>
        )}
        <h1 className="mt-4 text-3xl font-extrabold">{user.name ?? "Usuario"}</h1>
        <p className="text-muted">{user.email}</p>
        <p className="mt-2 text-sm text-muted">{user.bio ?? "Sin biografía aún."}</p>

        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
          <span className="glass rounded-full px-4 py-1.5">
            💳 {user.credits} créditos
          </span>
          {premiumActive ? (
            <span className="glass rounded-full bg-gradient-to-r from-yellow-brand/20 to-primary/20 px-4 py-1.5">
              ⭐ Premium
            </span>
          ) : (
            <span className="glass rounded-full px-4 py-1.5">
              👤 {user.role === "ADMIN" ? "Administrador" : "Miembro"}
            </span>
          )}
        </div>
      </div>

      {/* Aviso tras intento de pago Premium */}
      {upgrade === "success" && (
        <div className="fade-up mt-4 rounded-2xl border border-secondary/40 bg-secondary/10 p-4 text-center text-sm font-semibold text-secondary">
          🎉 ¡Bienvenido a Premium! Ya puedes disfrutar de la experiencia sin
          anuncios.
        </div>
      )}
      {upgrade === "error" && (
        <div className="fade-up mt-4 rounded-2xl border border-red-400/40 bg-red-400/10 p-4 text-center text-sm font-semibold text-red-400">
          No pudimos procesar tu pago. Inténtalo de nuevo.
        </div>
      )}
      {upgrade === "cancelled" && (
        <div className="fade-up mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm font-semibold text-muted">
          Has cancelado la suscripción. Si cambias de opinión, ¡te esperamos! 💛
        </div>
      )}

      {/* Monedero de créditos + Premium + anuncios */}
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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Mis Prompts ({user.prompts.length})
          </h2>
          <Link href="/prompt/nuevo" className="btn-primary !px-5 !py-2 text-sm">
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
                  className="glass flex items-center justify-between p-4 transition-colors hover:border-secondary/40"
                >
                  <div>
                    <div className="font-semibold">{prompt.title}</div>
                    <div className="text-xs text-muted">
                      {prompt.category} · {prompt.model}
                    </div>
                  </div>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase text-muted">
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

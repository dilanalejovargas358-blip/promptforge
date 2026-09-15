import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Administración",
};

// Puerta única del panel: nada de /admin/* se renderiza sin rol ADMIN.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  // Se comprueba contra la BD, no contra el token: un cambio de rol debe surtir
  // efecto sin esperar a que caduque la sesión.
  if (user?.role !== "ADMIN") redirect("/");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
            Administración
          </span>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Panel de <span className="gradient-text">moderación</span>
          </h1>
        </div>
        <Link href="/" className="text-sm text-muted transition-colors hover:text-white">
          ← Volver al sitio
        </Link>
      </div>
      {children}
    </div>
  );
}

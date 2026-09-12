import type { Metadata } from "next";
import Link from "next/link";
import { getConfig } from "@/lib/config";
import ConfigForm from "@/components/admin/ConfigForm";

export const metadata: Metadata = { title: "Configuración" };

// Los valores deben salir de la BD, no de la caché del build.
export const dynamic = "force-dynamic";

// El control de acceso lo pone app/admin/layout.tsx, que redirige a / si el rol
// no es ADMIN y lo comprueba contra la BD en cada petición.
export default async function AdminConfigPage() {
  const config = await getConfig();

  return (
    <div className="glass p-5 sm:p-6">
      <h2 className="text-lg font-bold">Configuración de Premium</h2>
      <p className="mt-1 text-xs text-muted">
        Precio, tipo de cambio y QR del pago por QR (Bolivia). Se aplica al
        instante en /profile/premium-manual, sin redesplegar.
      </p>

      <ConfigForm initial={config} />

      <Link
        href="/admin"
        className="mt-6 inline-block text-sm text-muted transition-colors hover:text-white"
      >
        ← Volver al panel
      </Link>
    </div>
  );
}

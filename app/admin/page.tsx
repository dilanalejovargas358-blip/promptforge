import { redirect } from "next/navigation";

// /admin no tiene contenido propio: la única sección es la cola de reportes.
export default function AdminIndexPage() {
  redirect("/admin/reports");
}

import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getDbUser } from "@/lib/credits";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export async function POST(req: Request) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Solo un administrador puede subir el QR." },
      { status: 403 }
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo." }, { status: 400 });
  }

  const extension = EXTENSIONS[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Formato no admitido. Usa PNG, JPG o WebP." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "La imagen supera los 5 MB." },
      { status: 400 }
    );
  }

  // Nombre con sufijo aleatorio a propósito: si se reutilizase el mismo path, el
  // CDN seguiría sirviendo el QR viejo desde caché y el admin creería que la
  // subida falló. El tipo se deriva del MIME validado, nunca del nombre original.
  const blob = await put(`premium/qr.${extension}`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url });
}

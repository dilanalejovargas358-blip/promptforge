import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { moderateTextDeep } from "@/lib/moderation-server";

const createPromptSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres").max(120),
  slug: z.string().min(3).max(120),
  description: z.string().max(500).optional().default(""),
  content: z.string().min(10, "El contenido debe tener al menos 10 caracteres"),
  category: z.string().min(1),
  model: z.string().min(1),
  tags: z.string().max(1000).optional().default("[]"),
  price: z.number().min(0).default(0),
  isPaid: z.boolean().default(false),
});

export async function GET() {
  try {
    const prompts = await prisma.prompt.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true, image: true } },
      },
      take: 50,
    });
    return NextResponse.json({ prompts });
  } catch (error) {
    console.error("Error al obtener prompts:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createPromptSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Moderación en dos capas (lista local + clasificador de DeepSeek) sobre todo
    // el texto visible del prompt. `matchedTerm` distingue en el log qué capa
    // rechazó: "deepseek:<categoría>" es el clasificador, lo demás es la lista
    // local.
    const mod = await moderateTextDeep(
      `${data.title} ${data.description} ${data.content}`
    );
    if (!mod.ok) {
      console.warn(
        `Moderación: prompt rechazado (${mod.category ?? "?"} · ${mod.matchedTerm ?? "?"}) por ${session.user.email}`
      );
      return NextResponse.json(
        { error: mod.reason, code: "MODERATION_REJECTED" },
        { status: 400 }
      );
    }

    const author = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!author) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const prompt = await prisma.prompt.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        content: data.content,
        category: data.category,
        model: data.model,
        price: data.price,
        isPaid: data.isPaid,
        tags: data.tags,
        status: "PUBLISHED",
        authorId: author.id,
      },
    });

    return NextResponse.json({ id: prompt.id }, { status: 201 });
  } catch (error) {
    console.error("Error al crear prompt:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

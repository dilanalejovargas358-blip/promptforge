import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

// ---------------------------------------------------------------------------
// Prompts demo. authorKey asigna el autor real (creado más abajo).
// totalCredits se siembra directo para poblar el ranking de creadores.
// ---------------------------------------------------------------------------
interface DemoPrompt {
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
  model: string;
  isFeatured?: boolean;
  isSponsored?: boolean;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  views: number;
  totalCredits: number;
  authorKey: string;
}

const DEMO_PROMPTS: DemoPrompt[] = [
  {
    title: "Escritor de Novela de Ciencia Ficción",
    slug: "escritor-novela-ciencia-ficcion",
    description:
      "Crea capítulos de ciencia ficción con worldbuilding detallado y personajes memorables.",
    content: `Actúa como un escritor de novelas de ciencia ficción galardonado. Vas a crear una historia original con los siguientes parámetros:

1. Ambientación: ${"{inserte_ambientacion}"}
2. Protagonista: ${"{inserte_personaje}"}
3. Tono: ${"{suspenso/épico/reflexivo}"}

Escribe el primer capítulo de 1000 palabras que incluya:
- Un hook inicial que atrape al lector en la primera frase.
- Diálogo que revele el conflicto central.
- Descripción sensorial del mundo (3 de los 5 sentidos).
- Un cliffhanger al final.

Devuelve el texto en Markdown.`,
    category: "Escritura",
    model: "ChatGPT",
    isFeatured: true,
    views: 1240,
    totalCredits: 45,
    authorKey: "studio",
  },
  {
    title: "Logo Futurista para Midjourney",
    slug: "logo-futurista-midjourney",
    description:
      "Genera logos corporativos futuristas con estilo neón y glassmorphism.",
    content: `Create a futuristic minimal logo for a tech brand. Style: neon glow, glassmorphism, dark background. The logo should combine:
--icon: ${"{descríbela_en_inglés}"}
--colors: coral (#FF6B6B), teal (#4ECDC4), purple (#C084FC)
--composition: centered emblem, no text
--lighting: subtle volumetric
--render: octane, 8k, --v 6, --ar 1:1, --style raw`,
    category: "Arte / Imagen",
    model: "Midjourney",
    views: 860,
    totalCredits: 60,
    authorKey: "studio",
  },
  {
    title: "Debugger de Código con Explicaciones",
    slug: "debugger-codigo-explicaciones",
    description:
      "Encuentra bugs en tu código y aprende por qué falla con explicaciones claras.",
    content: `Eres un ingeniero senior especializado en debug. Te voy a pasar un fragmento de código.

Tu tarea:
1. Identifica los errores (sintácticos, lógicos o de rendimiento).
2. Explica LA CAUSA de cada error en lenguaje sencillo.
3. Proporciona el código corregido completo.
4. Sugiere una mejora adicional opcional.

Formato de respuesta:
### 🐛 Error encontrado
### 🔍 Causa
### ✅ Solución
### 💡 Mejora opcional

Código a revisar:
${"{pega_tu_código_aquí}"}`,
    category: "Código",
    model: "ChatGPT",
    views: 2100,
    totalCredits: 30,
    authorKey: "dev",
  },
  {
    title: "Campaña de Marketing Viral",
    slug: "campana-marketing-viral",
    description:
      "Genera campañas de marketing completas: hooks, copy y calendario de publicación.",
    content: `Actúa como estratega de marketing para startups. Crea una campaña viral para: ${"{tu_producto}"}.

Entrega:
1. 5 hooks de 10 palabras o menos para redes sociales.
2. 3 publicaciones de LinkedIn con storytelling.
3. 3 publicaciones de Instagram con estructura de gancho-desarrollo-CTA.
4. Un calendario de publicación para 2 semanas.
5. Las 3 métricas clave a monitorizar.

Tono: ${"{audaz/profesional/divertido}"}
Marca personal del fundador: ${"{descríbela}"}`,
    category: "Marketing",
    model: "ChatGPT",
    views: 540,
    totalCredits: 15,
    authorKey: "admin",
  },
  {
    title: "Portada de Libro Fantástica",
    slug: "portada-libro-fantastica",
    description:
      "Diseña portadas de libros de fantasía épica dignas de una saga superventas.",
    content: `Epic fantasy book cover art, cinematic composition, ${"{describe_la_escena}"}. A lone ${"{protagonista}"} silhouetted against a glowing ${"{elemento_mágico}"}. Intricate detail, dramatic rim lighting, deep shadows, vibrant color grading (teal and coral accents). Vertical composition 2:3, title-safe margins top and bottom, --ar 2:3, --style raw, --v 6`,
    category: "Arte / Imagen",
    model: "Midjourney",
    views: 720,
    totalCredits: 40,
    authorKey: "luna",
  },
  {
    title: "Asistente de Productividad Diaria",
    slug: "asistente-productividad-diaria",
    description:
      "Planifica tu día, prioriza tareas y mantén el foco con este asistente.",
    content: `Actúa como mi asistente de productividad. Hoy es ${"{fecha}"}. Estas son mis tareas:
${"{lista_de_tareas}"}

Ayúdame a:
1. Priorizarlas usando la matriz Eisenhower.
2. Programarlas en bloques de tiempo con descansos (método Pomodoro).
3. Identificar y eliminar la tarea de mayor procrastinación.
4. Escribir mi "una tarea más importante del día".

Sé directo y conciso. No añadas texto de relleno.`,
    category: "Productividad",
    model: "Claude",
    views: 430,
    totalCredits: 12,
    authorKey: "dev",
  },
  {
    title: "Sistema de Prompts Reutilizables",
    slug: "sistema-prompts-reutilizables",
    description:
      "Arquitectura para crear una librería de prompts modulares y versionados.",
    content: `Actúa como arquitecto de ingeniería de prompts. Diseña un sistema para gestionar prompts reutilizables en un equipo:

1. Estructura de carpetas y convención de nombres.
2. Plantilla base con secciones: rol, contexto, tarea, formato, ejemplos.
3. Cómo versionar y probar cambios (A/B) sin romper prompts existentes.
4. Métricas para medir calidad de respuesta.

Entrégame el plan y 2 plantillas de ejemplo en Markdown.`,
    category: "Código",
    model: "ChatGPT",
    isSponsored: true, // Muestra el badge 🎯 PATROCINADO en la tarjeta
    views: 350,
    totalCredits: 8,
    authorKey: "dev",
  },
  {
    title: "Retrato Neo-noir en Acuarela",
    slug: "retrato-neo-noir-acuarela",
    description:
      "Retratos cinematográficos neo-noir con textura de acuarela y contraluz.",
    content: `Watercolor neo-noir portrait of ${"{personaje}"}, dramatic rim light from a ${"{color}"} neon, cinematic close-up, moody shadows, visible paper texture and paint bleeds, film grain. --ar 2:3 --style raw --v 6`,
    category: "Arte / Imagen",
    model: "Midjourney",
    views: 210,
    totalCredits: 20,
    authorKey: "luna",
  },
  {
    title: "Copywriter para Landing Pages",
    slug: "copywriter-landing-pages",
    description:
      "Redacta copy persuasivo y estructurado para landing pages de alto rendimiento.",
    content: `Actúa como copywriter senior de conversión. Para ${"{producto/servicio}"} dirigido a ${"{público}"}:

1. Escribe el titular + subtítulo (AIDA).
2. 3 propuestas de valor con prueba social.
3. Sección de características-beneficios (matriz F/B).
4. 2 variantes de CTA.
5. Preguntas frecuentes (5) para vencer objeciones.

Tono: ${"{cercano/autoridad}"}`,
    category: "Marketing",
    model: "Claude",
    views: 190,
    totalCredits: 5,
    authorKey: "admin",
  },
];

// ---------------------------------------------------------------------------

async function main() {
  console.log("🌱 Comenzando seed de PromptForge Pro...");

  // Limpia datos existentes (en orden por las claves foráneas, incluye tablas nuevas)
  await prisma.transaction.deleteMany();
  await prisma.report.deleteMany();
  await prisma.savedPrompt.deleteMany();
  await prisma.prompt.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.verificationToken.deleteMany();
  console.log("🧹 Base de datos limpiada.");

  const hash = async (s: string) => bcrypt.hash(s, 10);
  const adminPw = await hash("admin123");
  const creatorPw = await hash("creator123");
  const userPw = await hash("usuario123");

  // ---- Administrador -------------------------------------------------------
  const admin = await prisma.user.create({
    data: {
      name: "Admin Demo",
      email: "admin@promptforge.com",
      password: adminPw,
      role: "ADMIN",
      credits: 25,
      rays: 5,
      raysUpdatedAt: new Date(),
      bio: "Administrador de la plataforma.",
    },
  });

  // ---- Creadora principal: Premium activo (1º del ranking) -----------------
  const studio = await prisma.user.create({
    data: {
      name: "Creadora Studio",
      email: "creadora@promptforge.com",
      password: creatorPw,
      role: "USER",
      credits: 25, // Premium: 25 créditos IA al mes
      rays: 3,
      raysUpdatedAt: new Date(),
      bio: "Diseñadora de prompts para imagen y texto.",
      isPremium: true,
      premiumUntil: addDays(60),
    },
  });

  // ---- Creadores secundarios (para el ranking) -----------------------------
  const lunaPw = await hash("luna123");
  const luna = await prisma.user.create({
    data: {
      name: "Luna Visual",
      email: "luna@promptforge.com",
      password: lunaPw,
      role: "USER",
      credits: 5,
      rays: 1,
      raysUpdatedAt: new Date(),
      bio: "Arte generativo e ilustración.",
    },
  });

  const devPw = await hash("dev123");
  const dev = await prisma.user.create({
    data: {
      name: "Dev Snippets",
      email: "dev@promptforge.com",
      password: devPw,
      role: "USER",
      credits: 5,
      rays: 1,
      raysUpdatedAt: new Date(),
      bio: "Prompts técnicos y de productividad.",
    },
  });

  // ---- Donadores / probadores del sistema ----------------------------------
  const anaPw = await hash("ana123");
  await prisma.user.create({
    data: {
      name: "Ana Apoya",
      email: "ana@promptforge.com",
      password: anaPw,
      role: "USER",
      credits: 5,
      rays: 5, // Al tope, para probar "Apoyar" varias veces
      raysUpdatedAt: new Date(),
      bio: "Me encanta apoyar a los creadores.",
    },
  });

  // Usuario sin saldo: ideal para probar los avisos de "sin créditos IA" y
  // "sin rayitos". raysUpdatedAt = hace 30 min → el siguiente rayito llega pronto.
  const free = await prisma.user.create({
    data: {
      name: "Usuario Gratis",
      email: "usuario@promptforge.com",
      password: userPw,
      role: "USER",
      credits: 0,
      rays: 0,
      raysUpdatedAt: new Date(Date.now() - 30 * 60 * 1000),
      bio: "Explorando PromptForge y apoyando a los creadores.",
    },
  });

  const mariaPw = await hash("maria123");
  const maria = await prisma.user.create({
    data: {
      name: "María Premium",
      email: "maria@promptforge.com",
      password: mariaPw,
      role: "USER",
      credits: 25, // Premium: 25 créditos IA al mes
      rays: 5,
      raysUpdatedAt: new Date(),
      isPremium: true,
      premiumUntil: addDays(30),
      bio: "Premium: 25 créditos IA cada mes.",
    },
  });

  console.log("👤 Usuarios creados.");

  // ---- Prompts (asignando autor por authorKey) -----------------------------
  const authorByKey: Record<string, { id: string }> = {
    admin: { id: admin.id },
    studio: { id: studio.id },
    luna: { id: luna.id },
    dev: { id: dev.id },
  };

  for (const p of DEMO_PROMPTS) {
    await prisma.prompt.create({
      data: {
        title: p.title,
        slug: p.slug,
        description: p.description,
        content: p.content,
        category: p.category,
        model: p.model,
        isFeatured: p.isFeatured ?? false,
        isSponsored: p.isSponsored ?? false,
        status: p.status ?? "PUBLISHED",
        views: p.views,
        totalCredits: p.totalCredits,
        authorId: authorByKey[p.authorKey].id,
      },
    });
  }
  console.log(`✅ ${DEMO_PROMPTS.length} prompts de ejemplo creados.`);

  // ---- Historiales de ejemplo ----------------------------------------------
  // Premium María: muestra el feed de movimientos Premium en su perfil.
  await prisma.transaction.createMany({
    data: [
      {
        userId: maria.id,
        type: "PREMIUM",
        amount: 25,
        description: "Suscripción Premium — 25 créditos IA",
      },
      {
        userId: maria.id,
        type: "SPEND",
        amount: -1,
        description: "Optimización de prompt con IA",
      },
    ],
  });

  // Creadora Studio (Premium): también recibe apoyos, se refleja en su feed.
  await prisma.transaction.createMany({
    data: [
      {
        userId: studio.id,
        type: "RAY_EARN",
        amount: 1,
        description: 'Recibiste apoyo en "Logo Futurista para Midjourney"',
      },
      {
        userId: studio.id,
        type: "RAY_EARN",
        amount: 1,
        description: 'Recibiste apoyo en "Escritor de Novela de Ciencia Ficción"',
      },
    ],
  });

  // Usuario gratis: gastó su rayito inicial apoyando, por eso está a 0.
  // Sirve para mostrar el feed de movimientos y el aviso de "sin rayitos".
  await prisma.transaction.createMany({
    data: [
      {
        userId: free.id,
        type: "RAY_EARN",
        amount: 1,
        description: "Rayitos de bienvenida (+1)",
      },
      {
        userId: free.id,
        type: "RAY_SPEND",
        amount: -1,
        description: 'Apoyaste "Copywriter para Landing Pages"',
      },
    ],
  });

  console.log("🧾 Transacciones de ejemplo creadas.");

  // ---- Resumen de acceso ---------------------------------------------------
  console.log("\n🎉 Seed completado. Datos de acceso demo:");
  console.log("  Admin    : admin@promptforge.com  / admin123");
  console.log("  Creadora : creadora@promptforge.com / creator123  (⭐ Premium, 1º ranking)");
  console.log("  Luna     : luna@promptforge.com   / luna123");
  console.log("  Dev      : dev@promptforge.com    / dev123");
  console.log("  Ana      : ana@promptforge.com    / ana123    (5 rayitos → probar Apoyar)");
  console.log("  Gratis   : usuario@promptforge.com / usuario123 (0 créditos y 0 rayitos → probar avisos)");
  console.log("  Premium  : maria@promptforge.com  / maria123  (⭐ Premium → 25 créditos IA/mes)");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

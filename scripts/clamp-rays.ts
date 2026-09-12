// Corrección puntual de datos: recorta a RAYS_MAX los saldos de rayitos que
// quedaron por encima del tope (acumulados antes de que la regeneración
// aplicase el tope de forma atómica). Es idempotente: si nadie está por encima,
// no toca nada.
//
//   npx tsx scripts/clamp-rays.ts
import { PrismaClient } from "@prisma/client";
import { RAYS_MAX } from "../lib/constants";

const prisma = new PrismaClient();

async function main() {
  const over = await prisma.user.findMany({
    where: { rays: { gt: RAYS_MAX } },
    select: { email: true, rays: true },
    orderBy: { rays: "desc" },
  });

  if (over.length === 0) {
    console.log(`✅ Ningún usuario por encima de ${RAYS_MAX} rayitos.`);
    return;
  }

  console.log(`Usuarios por encima del tope (${RAYS_MAX}):`);
  for (const u of over) {
    console.log(`  ${String(u.rays).padStart(3)} → ${RAYS_MAX}  ${u.email}`);
  }

  const res = await prisma.user.updateMany({
    where: { rays: { gt: RAYS_MAX } },
    data: { rays: RAYS_MAX },
  });

  console.log(`\n✅ Recortados ${res.count} usuario(s) a ${RAYS_MAX} rayitos.`);
}

main()
  .catch((e) => {
    console.error("❌ Error recortando rayitos:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
  `;

  if (tables.length > 0) {
    const quoted = tables
      .map((t) => `"public"."${t.tablename.replace(/"/g, '')}"`)
      .join(', ');
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`);
  }

  console.log(`Truncated ${tables.length} table(s).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error('Demo reset failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });

import { execSync } from "child_process";
import { prisma } from "./lib/prisma";
import dotenv from "dotenv";

//dotenv.config({ path: ".env.test" });

if (process.env.NODE_ENV === "test") {
  beforeAll(async () => {
    try {
      execSync("npm run migrate:status");
    } catch (error) {
      try {
        console.log("Pending Migrations found. Updating test database...");
        execSync("npm run migrate:deploy");
      } catch (deployError) {
        console.error("Error to apply migrations: ", deployError);
        process.exit(1);
      }
    }

    await cleanDatabase();
  }, 60000);

  async function cleanDatabase() {
    const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

    for (const { tablename } of tablenames) {
      if (tablename !== "_prisma_migrations") {
        try {
          await prisma.$executeRawUnsafe(
            `TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE;`,
          );
        } catch (error) {
          console.error(`Error to cleam table ${tablename}:`, error);
        }
      }
    }
  }

  afterAll(async () => {
    await prisma.$disconnect();
  });
}

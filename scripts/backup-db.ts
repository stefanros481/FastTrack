import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import { prisma } from "../src/lib/prisma";

const outputDir = process.argv[2];

if (!outputDir) {
  console.error("Usage: bun run scripts/backup-db.ts <output-directory>");
  process.exit(1);
}

async function main() {
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  try {
    const users = await prisma.user.findMany();
    writeFileSync(join(outputDir, "User.json"), JSON.stringify(users, null, 2));
    console.log(`Exported ${users.length} rows from User`);

    const sessions = await prisma.fastingSession.findMany();
    writeFileSync(
      join(outputDir, "FastingSession.json"),
      JSON.stringify(sessions, null, 2)
    );
    console.log(`Exported ${sessions.length} rows from FastingSession`);

    const settings = await prisma.userSettings.findMany();
    writeFileSync(
      join(outputDir, "UserSettings.json"),
      JSON.stringify(settings, null, 2)
    );
    console.log(`Exported ${settings.length} rows from UserSettings`);

    console.log(`\nBackup exported to ${outputDir}`);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("connect") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("database"))
    ) {
      console.error(
        "Failed to connect to database — check .env.local"
      );
    } else {
      console.error("Backup failed:", error);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

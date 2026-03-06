import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = { database: "ok" as "ok" | "error", auth: "ok" as "ok" | "error" };

  // Auth check first
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch {
    checks.auth = "error";
    return NextResponse.json(
      { status: "error", checks: { ...checks, auth: "error" } },
      { status: 503 }
    );
  }

  // Database check — lightweight query against User table (WHERE false, zero rows)
  try {
    await prisma.user.count({ where: { id: "nonexistent" } });
  } catch {
    checks.database = "error";
  }

  const status = checks.database === "ok" && checks.auth === "ok" ? "ok" : "error";
  return NextResponse.json(
    { status, checks },
    { status: status === "ok" ? 200 : 503 }
  );
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const cursor = searchParams.get("cursor") || undefined;
    const pageSizeParam = parseInt(searchParams.get("pageSize") || "20", 10);
    const pageSize = Math.min(
      Number.isNaN(pageSizeParam) ? 20 : pageSizeParam,
      50
    );

    const sessions = await prisma.fastingSession.findMany({
      where: {
        userId: session.user.id,
        endedAt: { not: null },
      },
      orderBy: { startedAt: "desc" },
      take: pageSize + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        startedAt: true,
        endedAt: true,
        goalMinutes: true,
        notes: true,
      },
    });

    const hasMore = sessions.length > pageSize;
    const data = hasMore ? sessions.slice(0, pageSize) : sessions;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return NextResponse.json({
      data: data.map((s) => ({
        id: s.id,
        startedAt: s.startedAt.toISOString(),
        endedAt: s.endedAt!.toISOString(),
        goalMinutes: s.goalMinutes,
        notes: s.notes,
      })),
      nextCursor,
      hasMore,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

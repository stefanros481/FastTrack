"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const MAX_USERS = parseInt(process.env.MAX_USERS || "200", 10);

const userIdSchema = z.string().min(1, "User ID is required");

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" as const, session: null };
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!dbUser || dbUser.role !== "admin") {
    return { error: "Unauthorized" as const, session: null };
  }
  return { error: null, session };
}

export async function getUsers() {
  const { error } = await requireAdmin();
  if (error) return { error };

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return {
    users,
    totalCount: users.length,
    maxUsers: MAX_USERS,
  };
}

export async function deactivateUser(userId: string) {
  const { error, session } = await requireAdmin();
  if (error) return { error };

  const parsed = userIdSchema.safeParse(userId);
  if (!parsed.success) return { error: "Invalid user ID" };

  // Prevent self-deactivation
  if (userId === session!.user.id) {
    return { error: "You cannot deactivate your own account" };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { isActive: true, role: true },
  });
  if (!target) return { error: "User not found" };
  if (!target.isActive) return { error: "User is already inactive" };

  // If target is admin, check they're not the last admin
  if (target.role === "admin") {
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    if (adminCount <= 1) {
      return { error: "Cannot deactivate the last admin" };
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

  revalidatePath("/settings/admin");
  return { success: true };
}

export async function reactivateUser(userId: string) {
  const { error } = await requireAdmin();
  if (error) return { error };

  const parsed = userIdSchema.safeParse(userId);
  if (!parsed.success) return { error: "Invalid user ID" };

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { isActive: true },
  });
  if (!target) return { error: "User not found" };
  if (target.isActive) return { error: "User is already active" };

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: true },
  });

  revalidatePath("/settings/admin");
  return { success: true };
}

export async function promoteToAdmin(userId: string) {
  const { error } = await requireAdmin();
  if (error) return { error };

  const parsed = userIdSchema.safeParse(userId);
  if (!parsed.success) return { error: "Invalid user ID" };

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, isActive: true },
  });
  if (!target) return { error: "User not found" };
  if (target.role === "admin") return { error: "User is already an admin" };
  if (!target.isActive) return { error: "Cannot promote an inactive user" };

  await prisma.user.update({
    where: { id: userId },
    data: { role: "admin" },
  });

  revalidatePath("/settings/admin");
  return { success: true };
}

export async function demoteFromAdmin(userId: string) {
  const { error, session } = await requireAdmin();
  if (error) return { error };

  const parsed = userIdSchema.safeParse(userId);
  if (!parsed.success) return { error: "Invalid user ID" };

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target) return { error: "User not found" };
  if (target.role !== "admin") return { error: "User is not an admin" };

  // Prevent last admin demotion
  const adminCount = await prisma.user.count({ where: { role: "admin" } });
  if (adminCount <= 1) {
    return { error: "Cannot demote the last admin" };
  }

  // Prevent self-demotion if last admin (already covered above, but explicit)
  if (userId === session!.user.id && adminCount <= 1) {
    return { error: "Cannot demote yourself as the last admin" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: "user" },
  });

  revalidatePath("/settings/admin");
  return { success: true };
}

'use server';

import { prisma } from '@/lib/prisma';
import { checkAuth, loginAdmin, logoutAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Authentication Actions
export async function authenticateAdmin(password: string) {
  const success = await loginAdmin(password);
  if (success) {
    revalidatePath('/');
    revalidatePath('/admin/dashboard');
  }
  return success;
}

export async function deauthenticateAdmin() {
  await logoutAdmin();
  revalidatePath('/');
  revalidatePath('/admin/dashboard');
}

export async function verifySession() {
  return await checkAuth();
}

// Project Actions
export async function createProject(data: {
  title: string;
  description: string;
  longDescription?: string | null;
  image?: string | null;
  githubUrl?: string | null;
  liveUrl?: string | null;
  tags: string;
  order?: number;
  featured?: boolean;
}) {
  const isAuth = await checkAuth();
  if (!isAuth) throw new Error('Unauthorized');

  const project = await prisma.project.create({
    data: {
      ...data,
      order: Number(data.order) || 0,
      featured: Boolean(data.featured),
    },
  });

  revalidatePath('/');
  revalidatePath('/admin/dashboard');
  return project;
}

export async function updateProject(
  id: string,
  data: {
    title?: string;
    description?: string;
    longDescription?: string | null;
    image?: string | null;
    githubUrl?: string | null;
    liveUrl?: string | null;
    tags?: string;
    order?: number;
    featured?: boolean;
  }
) {
  const isAuth = await checkAuth();
  if (!isAuth) throw new Error('Unauthorized');

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...data,
      order: data.order !== undefined ? Number(data.order) : undefined,
      featured: data.featured !== undefined ? Boolean(data.featured) : undefined,
    },
  });

  revalidatePath('/');
  revalidatePath('/admin/dashboard');
  return project;
}

export async function deleteProject(id: string) {
  const isAuth = await checkAuth();
  if (!isAuth) throw new Error('Unauthorized');

  await prisma.project.delete({
    where: { id },
  });

  revalidatePath('/');
  revalidatePath('/admin/dashboard');
}

// Skill Actions
export async function createSkill(data: {
  name: string;
  category: string;
  level?: number;
  order?: number;
}) {
  const isAuth = await checkAuth();
  if (!isAuth) throw new Error('Unauthorized');

  const skill = await prisma.skill.create({
    data: {
      ...data,
      level: data.level !== undefined ? Number(data.level) : 80,
      order: Number(data.order) || 0,
    },
  });

  revalidatePath('/');
  revalidatePath('/admin/dashboard');
  return skill;
}

export async function updateSkill(
  id: string,
  data: {
    name?: string;
    category?: string;
    level?: number;
    order?: number;
  }
) {
  const isAuth = await checkAuth();
  if (!isAuth) throw new Error('Unauthorized');

  const skill = await prisma.skill.update({
    where: { id },
    data: {
      ...data,
      level: data.level !== undefined ? Number(data.level) : undefined,
      order: data.order !== undefined ? Number(data.order) : undefined,
    },
  });

  revalidatePath('/');
  revalidatePath('/admin/dashboard');
  return skill;
}

export async function deleteSkill(id: string) {
  const isAuth = await checkAuth();
  if (!isAuth) throw new Error('Unauthorized');

  await prisma.skill.delete({
    where: { id },
  });

  revalidatePath('/');
  revalidatePath('/admin/dashboard');
}

// Achievement Actions
export async function createAchievement(data: {
  title: string;
  description?: string | null;
  date: string;
  link?: string | null;
  order?: number;
}) {
  const isAuth = await checkAuth();
  if (!isAuth) throw new Error('Unauthorized');

  const achievement = await prisma.achievement.create({
    data: {
      ...data,
      order: Number(data.order) || 0,
    },
  });

  revalidatePath('/');
  revalidatePath('/admin/dashboard');
  return achievement;
}

export async function updateAchievement(
  id: string,
  data: {
    title?: string;
    description?: string | null;
    date?: string;
    link?: string | null;
    order?: number;
  }
) {
  const isAuth = await checkAuth();
  if (!isAuth) throw new Error('Unauthorized');

  const achievement = await prisma.achievement.update({
    where: { id },
    data: {
      ...data,
      order: data.order !== undefined ? Number(data.order) : undefined,
    },
  });

  revalidatePath('/');
  revalidatePath('/admin/dashboard');
  return achievement;
}

export async function deleteAchievement(id: string) {
  const isAuth = await checkAuth();
  if (!isAuth) throw new Error('Unauthorized');

  await prisma.achievement.delete({
    where: { id },
  });

  revalidatePath('/');
  revalidatePath('/admin/dashboard');
}

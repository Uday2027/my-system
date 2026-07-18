import { redirect } from 'next/navigation';
import { checkAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardClient from '@/components/admin/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const isAuth = await checkAuth();

  if (!isAuth) {
    redirect('/admin');
  }

  // Fetch initial content from database
  const [projects, skills, achievements] = await Promise.all([
    prisma.project.findMany({ orderBy: { order: 'asc' } }),
    prisma.skill.findMany({ orderBy: { order: 'asc' } }),
    prisma.achievement.findMany({ orderBy: { order: 'asc' } }),
  ]);

  return (
    <DashboardClient
      initialProjects={projects}
      initialSkills={skills}
      initialAchievements={achievements}
    />
  );
}

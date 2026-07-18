import { prisma } from '@/lib/prisma';
import DesktopManager from '@/components/DesktopManager';
import CommandPalette from '@/components/CommandPalette';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [projects, skills, achievements] = await Promise.all([
    prisma.project.findMany({ orderBy: { order: 'asc' } }),
    prisma.skill.findMany({ orderBy: { order: 'asc' } }),
    prisma.achievement.findMany({ orderBy: { order: 'asc' } }),
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Retro Desktop Window Manager OS */}
      <DesktopManager projects={projects} skills={skills} achievements={achievements} />

      {/* Spotlight Command Palette (Cmd+K) */}
      <CommandPalette projects={projects} />
    </div>
  );
}

import DesktopManager from '@/components/DesktopManager';
import CommandPalette from '@/components/CommandPalette';
import Shell from '@/components/os/Shell';
import { projects, skills, achievements } from '@/lib/portfolioData';

export default function HomePage() {
  const counts = {
    projects: projects.length,
    skills: skills.length,
    achievements: achievements.length,
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <Shell counts={counts}>
        {/* Retro Desktop Window Manager OS */}
        <DesktopManager projects={projects} skills={skills} achievements={achievements} />

        {/* Spotlight Command Palette (Cmd+K) */}
        <CommandPalette projects={projects} />
      </Shell>
    </div>
  );
}

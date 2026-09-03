import DesktopManager from '@/components/DesktopManager';
import CommandPalette from '@/components/CommandPalette';
import { projects, skills, achievements } from '@/lib/portfolioData';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Retro Desktop Window Manager OS */}
      <DesktopManager projects={projects} skills={skills} achievements={achievements} />

      {/* Spotlight Command Palette (Cmd+K) */}
      <CommandPalette projects={projects} />
    </div>
  );
}

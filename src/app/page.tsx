import { prisma } from '@/lib/prisma';
import DesktopManager from '@/components/DesktopManager';
import CommandPalette from '@/components/CommandPalette';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let projects: any[] = [];
  let skills: any[] = [];
  let achievements: any[] = [];

  try {
    [projects, skills, achievements] = await Promise.all([
      prisma.project.findMany({ orderBy: { order: 'asc' } }),
      prisma.skill.findMany({ orderBy: { order: 'asc' } }),
      prisma.achievement.findMany({ orderBy: { order: 'asc' } }),
    ]);
  } catch (error) {
    console.error('Database connection failed. Loading fallback static mock data. Error:', error);
    
    // Static Fallback Data
    projects = [
      {
        id: 'fallback-p1',
        title: 'Aether - Glassmorphic Finance Dashboard',
        description: 'A premium, interactive finance tracking dashboard with crypto integrations and sleek charts.',
        longDescription: 'Aether is a modern financial visualization tool built with Next.js, Shadcn/UI, and ChartJS.',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
        githubUrl: 'https://github.com/example/aether-dashboard',
        liveUrl: 'https://aether-dashboard.example.com',
        tags: 'Next.js,TypeScript,Shadcn UI,TailwindCSS,Prisma,SQLite',
        order: 1,
        featured: true,
      },
      {
        id: 'fallback-p2',
        title: 'Nexus - AI-Powered Code Reviewer',
        description: 'An automated code quality assistant that integrates with GitHub PRs and suggests optimization patches.',
        longDescription: 'Nexus connects to GitHub repositories and automatically reviews open Pull Requests using LLMs.',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        githubUrl: 'https://github.com/example/nexus-ai-reviews',
        liveUrl: 'https://nexus-ai.example.com',
        tags: 'Next.js,React,OpenAI API,GitHub API,TailwindCSS',
        order: 2,
        featured: true,
      },
    ];

    skills = [
      { id: 's1', name: 'React', category: 'Frontend', level: 95, order: 1 },
      { id: 's2', name: 'Next.js', category: 'Frontend', level: 90, order: 2 },
      { id: 's3', name: 'TypeScript', category: 'Frontend', level: 88, order: 3 },
      { id: 's4', name: 'TailwindCSS', category: 'Frontend', level: 95, order: 4 },
      { id: 's5', name: 'Node.js', category: 'Backend', level: 85, order: 5 },
      { id: 's6', name: 'Prisma ORM', category: 'Backend', level: 90, order: 6 },
    ];

    achievements = [
      {
        id: 'a1',
        title: 'Software Engineer Intern at InfancyIT',
        description: 'Assisting in developing web applications, working with React and Node.js, and collaborating with cross-functional development teams.',
        date: 'June 2026 - Present',
        link: 'https://infancyit.com',
        order: 1,
      },
    ];
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Retro Desktop Window Manager OS */}
      <DesktopManager projects={projects} skills={skills} achievements={achievements} />

      {/* Spotlight Command Palette (Cmd+K) */}
      <CommandPalette projects={projects} />
    </div>
  );
}
/* Admin panel sizing overrides updated */

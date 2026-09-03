/**
 * Portfolio content — loaded from a static JSON file (no database).
 * Edit the data in `src/data/portfolio.json`.
 */
import data from '@/data/portfolio.json';

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  image: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
  tags: string; // comma-separated
  order: number;
  featured: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number; // 0-100
  order: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  link: string | null;
  order: number;
}

export interface About {
  name: string;
  role: string;
  status: string;
  location: string;
  tagline: string;
  paragraphs: string[];
  recentWork: string[];
  products: string[];
  stack: Record<string, string[]>;
  interests: string[];
  closing: string;
}

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

export const projects: Project[] = [...(data.projects as Project[])].sort(byOrder);
export const skills: Skill[] = [...(data.skills as Skill[])].sort(byOrder);
export const achievements: Achievement[] = [...(data.achievements as Achievement[])].sort(byOrder);
export const about: About = data.about as About;

// Back-compat aliases (previous name of these exports).
export const projectsSeed = projects;
export const skillsSeed = skills;
export const achievementsSeed = achievements;

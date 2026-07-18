import { prisma } from '../src/lib/prisma';

async function main() {
  // Clear existing data
  await prisma.project.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.achievement.deleteMany();

  console.log('Seeding initial projects...');
  await prisma.project.createMany({
    data: [
      {
        title: 'Aether - Glassmorphic Finance Dashboard',
        description: 'A premium, interactive finance tracking dashboard with crypto integrations and sleek charts.',
        longDescription: 'Aether is a modern financial visualization tool built with Next.js, Shadcn/UI, and ChartJS. It allows users to track their investments, monitor cryptocurrency prices in real-time, and get automated monthly budgeting reports. The app features glassmorphic design and highly polished micro-interactions.',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
        githubUrl: 'https://github.com/example/aether-dashboard',
        liveUrl: 'https://aether-dashboard.example.com',
        tags: 'Next.js,TypeScript,Shadcn UI,TailwindCSS,Prisma,SQLite',
        order: 1,
        featured: true,
      },
      {
        title: 'Nexus - AI-Powered Code Reviewer',
        description: 'An automated code quality assistant that integrates with GitHub PRs and suggests optimization patches.',
        longDescription: 'Nexus connects to GitHub repositories and automatically reviews open Pull Requests using LLMs. It checks for common security vulnerabilities, architectural smell, performance bottlenecks, and styles. It writes comments directly onto GitHub line diffs and recommends drop-in patch suggestions.',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        githubUrl: 'https://github.com/example/nexus-ai-reviews',
        liveUrl: 'https://nexus-ai.example.com',
        tags: 'Next.js,React,OpenAI API,GitHub API,TailwindCSS',
        order: 2,
        featured: true,
      },
      {
        title: 'Zephyr - High-Speed Static Site Generator',
        description: 'A Rust-inspired lightning-fast static site compiler that compiles Markdown to static sites in milliseconds.',
        longDescription: 'Zephyr is a lightweight, zero-config static site generator. It compiles hundreds of Markdown articles into HTML and CSS files in less than 50 milliseconds. Features include automatic SEO tags, RSS feed creation, absolute layouts, and a built-in dev server with hot reload.',
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
        githubUrl: 'https://github.com/example/zephyr-ssg',
        liveUrl: 'https://zephyr.example.com',
        tags: 'TypeScript,Node.js,Markdown,Vercel,SEO',
        order: 3,
        featured: false,
      },
    ],
  });

  console.log('Seeding initial skills...');
  await prisma.skill.createMany({
    data: [
      // Frontend
      { name: 'React', category: 'Frontend', level: 95, order: 1 },
      { name: 'Next.js', category: 'Frontend', level: 90, order: 2 },
      { name: 'TypeScript', category: 'Frontend', level: 88, order: 3 },
      { name: 'TailwindCSS', category: 'Frontend', level: 95, order: 4 },
      { name: 'HTML5/CSS3', category: 'Frontend', level: 98, order: 5 },
      // Backend
      { name: 'Node.js', category: 'Backend', level: 85, order: 6 },
      { name: 'Express.js', category: 'Backend', level: 82, order: 7 },
      { name: 'Prisma ORM', category: 'Backend', level: 90, order: 8 },
      { name: 'SQLite / PostgreSQL', category: 'Backend', level: 85, order: 9 },
      // Tools/DevOps
      { name: 'Git & GitHub', category: 'Tools & DevOps', level: 92, order: 10 },
      { name: 'Docker', category: 'Tools & DevOps', level: 75, order: 11 },
      { name: 'AWS (S3/EC2)', category: 'Tools & DevOps', level: 70, order: 12 },
      { name: 'Vercel / Netlify', category: 'Tools & DevOps', level: 95, order: 13 },
    ],
  });

  console.log('Seeding initial achievements...');
  await prisma.achievement.createMany({
    data: [
      {
        title: 'Software Engineer Intern at InfancyIT',
        description: 'Assisting in developing web applications, working with React and Node.js, and collaborating with cross-functional development teams.',
        date: 'June 2026 - Present',
        link: 'https://infancyit.com',
        order: 1,
      },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  image: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
  tags: string;
}

interface ProjectListProps {
  projects: Project[];
}

export default function ProjectList({ projects }: ProjectListProps) {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Track cursor coordinates globally on hover
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    if (isHovering) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovering]);

  const handleMouseEnterRow = (image: string | null) => {
    if (image) {
      setHoveredImage(image);
      setIsHovering(true);
    }
  };

  const handleMouseLeaveRow = () => {
    setIsHovering(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {projects.length === 0 ? (
        <p className="text-muted-foreground text-sm">No projects yet.</p>
      ) : (
        <div className="space-y-10">
          {projects.map((project) => (
            <div
              key={project.id}
              className="py-2 group/row border-b border-white/[0.02] last:border-0 pb-6"
              onMouseEnter={() => handleMouseEnterRow(project.image)}
              onMouseLeave={handleMouseLeaveRow}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-foreground text-sm font-medium group-hover/row:text-white transition-colors duration-300">
                  {project.title}
                </h3>
                <div className="flex items-center gap-3 shrink-0">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Live ↗
                    </a>
                  )}
                </div>
              </div>
              <p className="text-sm mt-1 leading-relaxed text-muted-foreground group-hover/row:text-muted-foreground/80 transition-colors">
                {project.description}
              </p>
              <p className="text-xs text-muted-foreground/50 mt-2">{project.tags}</p>
            </div>
          ))}
        </div>
      )}

      {/* Floating Grayscale Image Preview */}
      <div
        className="pointer-events-none fixed z-50 overflow-hidden rounded-xl border border-white/10 bg-neutral-900 shadow-2xl transition-opacity duration-300 ease-out"
        style={{
          width: '260px',
          height: '150px',
          left: 0,
          top: 0,
          opacity: isHovering && hoveredImage ? 1 : 0,
          transform: `translate3d(${mousePos.x + 24}px, ${mousePos.y - 75}px, 0)`,
          willChange: 'transform, opacity',
        }}
      >
        {hoveredImage && (
          <img
            src={hoveredImage}
            alt="Preview"
            className="w-full h-full object-cover grayscale brightness-95 contrast-105 transition-transform duration-500 scale-100 group-hover/row:scale-105"
          />
        )}
      </div>
    </div>
  );
}

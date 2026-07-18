'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Command, ArrowRight, CornerDownLeft, Sparkles, Sliders, Navigation, Link as LinkIcon, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  id: string;
  title: string;
}

interface CommandPaletteProps {
  projects: Project[];
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Actions' | 'Navigation' | 'Projects' | 'Typography' | 'Page Tone' | 'Spacing';
  action: () => void;
}

export default function CommandPalette({ projects }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Toggle palette open/close with keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    const handleOpenEvent = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleOpenEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleOpenEvent);
    };
  }, []);

  // Reset indices and focus when opening
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Smooth scroll to an element by selector
  const scrollTo = (selector: string) => {
    setIsOpen(false);
    const el = document.querySelector(selector);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // Helper to dispatch Reader Mode settings changes
  const dispatchReaderSetting = (eventName: string, value: string) => {
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent(eventName, { detail: value }));
    toast.success(`Theme updated to ${value}`);
  };

  // List of all static commands + dynamic project commands
  const getCommands = (): CommandItem[] => {
    const staticCommands: CommandItem[] = [
      // Navigation
      {
        id: 'nav-projects',
        title: 'Jump to Projects section',
        subtitle: 'Go to Featured Projects list',
        category: 'Navigation',
        action: () => scrollTo('#projects'),
      },
      {
        id: 'nav-skills',
        title: 'Jump to Skills section',
        subtitle: 'Go to Technical Stack details',
        category: 'Navigation',
        action: () => scrollTo('#skills'),
      },
      {
        id: 'nav-experience',
        title: 'Jump to Experience section',
        subtitle: 'Go to career timeline and history',
        category: 'Navigation',
        action: () => scrollTo('#experience'),
      },
      {
        id: 'nav-sandbox',
        title: 'Jump to Sandbox',
        subtitle: 'Go to ASCII Art Lab playground',
        category: 'Navigation',
        action: () => scrollTo('#sandbox'),
      },
      
      // Page Tone
      {
        id: 'theme-ink',
        title: 'Set Tone: Ink Black',
        subtitle: 'High contrast dark reading layout',
        category: 'Page Tone',
        action: () => dispatchReaderSetting('reader-set-theme', 'ink'),
      },
      {
        id: 'theme-paper',
        title: 'Set Tone: Paper White',
        subtitle: 'High contrast light reading layout',
        category: 'Page Tone',
        action: () => dispatchReaderSetting('reader-set-theme', 'paper'),
      },
      {
        id: 'theme-sepia',
        title: 'Set Tone: Warm Sepia',
        subtitle: 'Eye-friendly sepia book reading layout',
        category: 'Page Tone',
        action: () => dispatchReaderSetting('reader-set-theme', 'sepia'),
      },

      // Typography
      {
        id: 'font-sans',
        title: 'Set Typography: Sans-Serif',
        subtitle: 'Clean, modern typography layout',
        category: 'Typography',
        action: () => dispatchReaderSetting('reader-set-font', 'sans'),
      },
      {
        id: 'font-serif',
        title: 'Set Typography: Serif',
        subtitle: 'Sophisticated traditional reading typography',
        category: 'Typography',
        action: () => dispatchReaderSetting('reader-set-font', 'serif'),
      },
      {
        id: 'font-mono',
        title: 'Set Typography: Monospace',
        subtitle: 'Developer-oriented terminal font stack',
        category: 'Typography',
        action: () => dispatchReaderSetting('reader-set-font', 'mono'),
      },

      // Density
      {
        id: 'density-standard',
        title: 'Set Spacing: Standard Layout',
        subtitle: 'Generous whitespace layout',
        category: 'Spacing',
        action: () => dispatchReaderSetting('reader-set-density', 'standard'),
      },
      {
        id: 'density-compact',
        title: 'Set Spacing: Compact Layout',
        subtitle: 'Condensed density layout',
        category: 'Spacing',
        action: () => dispatchReaderSetting('reader-set-density', 'compact'),
      },

      // Actions
      {
        id: 'action-resume',
        title: 'Download CV / Resume',
        subtitle: 'Opens printable resume PDF',
        category: 'Actions',
        action: () => {
          setIsOpen(false);
          window.open('/resume.pdf', '_blank');
        },
      },
      {
        id: 'action-email',
        title: 'Copy Email to Clipboard',
        subtitle: 'Copies zubayerhossain1009@gmail.com',
        category: 'Actions',
        action: () => {
          setIsOpen(false);
          navigator.clipboard.writeText('zubayerhossain1009@gmail.com');
          toast.success('Email copied to clipboard!');
        },
      },
      {
        id: 'action-github',
        title: 'Open GitHub Profile',
        subtitle: 'GitHub profile link (Uday2027)',
        category: 'Actions',
        action: () => {
          setIsOpen(false);
          window.open('https://github.com/Uday2027', '_blank');
        },
      },
      {
        id: 'action-linkedin',
        title: 'Open LinkedIn Profile',
        subtitle: 'LinkedIn profile link',
        category: 'Actions',
        action: () => {
          setIsOpen(false);
          window.open('https://www.linkedin.com/in/zubayer-hossain-uday-3481841bb/', '_blank');
        },
      },
      {
        id: 'action-admin',
        title: 'Go to Admin Console',
        subtitle: 'Open auth credentials page',
        category: 'Actions',
        action: () => {
          setIsOpen(false);
          window.location.href = '/admin';
        },
      },
    ];

    // Dynamic project jump commands
    const projectCommands: CommandItem[] = projects.map((p) => ({
      id: `project-${p.id}`,
      title: `Jump to Project: ${p.title}`,
      subtitle: 'Scroll directly to this project card',
      category: 'Projects',
      action: () => scrollTo('#projects'), // Smooth scroll to Projects section
    }));

    return [...staticCommands, ...projectCommands];
  };

  // Filter commands by search term
  const filteredCommands = getCommands().filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase()) ||
    (item.subtitle && item.subtitle.toLowerCase().includes(search.toLowerCase()))
  );

  // Keep selection in bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Handle keys inside input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Auto-scroll list when selection index moves out of view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const selectedElement = list.children[selectedIndex] as HTMLElement;
    if (!selectedElement) return;

    const listHeight = list.clientHeight;
    const itemHeight = selectedElement.clientHeight;
    const itemTop = selectedElement.offsetTop;

    if (itemTop + itemHeight > list.scrollTop + listHeight) {
      list.scrollTop = itemTop + itemHeight - listHeight;
    } else if (itemTop < list.scrollTop) {
      list.scrollTop = itemTop;
    }
  }, [selectedIndex]);

  return (
    <>
      {/* Spotlight Dialog Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 backdrop-blur-xs pt-[10vh] px-4 font-mono text-xs"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Container */}
          <div
            ref={containerRef}
            className="w-full max-w-lg bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[70vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Header */}
            <div className="flex items-center px-4 py-3.5 border-b border-white/5 gap-3 shrink-0">
              <Search className="w-4 h-4 text-neutral-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search details..."
                className="flex-1 bg-transparent text-white placeholder-neutral-500 border-0 outline-none p-0 focus:ring-0"
              />
              <span className="text-[9px] uppercase tracking-wider text-neutral-600 font-semibold shrink-0">
                ESC to close
              </span>
            </div>

            {/* List Results */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto divide-y divide-white/[0.02]"
            >
              {filteredCommands.length === 0 ? (
                <div className="p-8 text-center text-neutral-600">
                  No matching commands found.
                </div>
              ) : (
                filteredCommands.map((cmd, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-neutral-800 text-white' : 'text-neutral-400'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Category Icon */}
                        <div className="pt-0.5 shrink-0">
                          {cmd.category === 'Navigation' && <Navigation className="w-3.5 h-3.5" />}
                          {cmd.category === 'Projects' && <Sparkles className="w-3.5 h-3.5" />}
                          {cmd.category === 'Actions' && <FileText className="w-3.5 h-3.5" />}
                          {(cmd.category === 'Page Tone' || cmd.category === 'Typography' || cmd.category === 'Spacing') && <Sliders className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-sm block leading-none">{cmd.title}</span>
                          {cmd.subtitle && (
                            <span className={`text-[10px] block mt-1 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                              {cmd.subtitle}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Selection indicator */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[9px] uppercase font-semibold px-1.5 py-0.5 border rounded ${
                          isSelected
                            ? 'border-white/20 text-white bg-neutral-900'
                            : 'border-white/5 text-neutral-600 bg-neutral-950/20'
                        }`}>
                          {cmd.category}
                        </span>
                        {isSelected && (
                          <CornerDownLeft className="w-3 h-3 text-neutral-400" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
// Credentials updated for Uday

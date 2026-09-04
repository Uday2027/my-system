'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Folder, FileText, Terminal as TerminalIcon, Image as ImageIcon,
  User, Sliders, Menu, X, Minimize2, Mail, ExternalLink, ArrowUpRight,
  Battery, BatteryCharging, Wifi, WifiOff, Volume2, VolumeX, Tv, Github, Linkedin, Gamepad2, BookText, HelpCircle
} from 'lucide-react';
import FloatingTerminal from './FloatingTerminal';
import AsciiArtLab from './AsciiArtLab';
import SnakeGame from './apps/SnakeGame';
import Game2048 from './apps/Game2048';
import Guestbook from './apps/Guestbook';
import StackQuiz from './apps/StackQuiz';
import { about } from '@/lib/portfolioData';
import ProjectList from './ProjectList';
import { toast } from 'sonner';
import { useSettings, setSetting, type Crt } from '@/lib/os/settings';

interface Project {
  id: string;
  title: string;
  description: string;
  image: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
  tags: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
}

interface Achievement {
  id: string;
  title: string;
  date: string;
  description: string | null;
}

interface DesktopManagerProps {
  projects: Project[];
  skills: Skill[];
  achievements: Achievement[];
}

type WindowKey = 'about' | 'projects' | 'skills' | 'experience' | 'contact' | 'shell' | 'artlab' | 'youtube' | 'snake' | 'game2048' | 'guestbook' | 'quiz';
type FontOption = 'sans' | 'serif' | 'mono';
type ThemeOption = 'ink' | 'paper' | 'sepia' | 'amber' | 'green' | 'c64';
type DensityOption = 'standard' | 'compact';

interface WindowState {
  open: boolean;
  x: number;
  y: number;
  z: number;
  width: string;
  height: string;
  minimized?: boolean;
  maximized?: boolean;
  prevGeom?: { x: number; y: number; width: string; height: string };
}

export default function DesktopManager({ projects, skills, achievements }: DesktopManagerProps) {
  const settings = useSettings();
  const theme = settings.tone as ThemeOption;
  const font = settings.typography as FontOption;
  const density = settings.density as DensityOption;
  const setTheme = (t: ThemeOption) => setSetting('tone', t);
  const setFont = (f: FontOption) => setSetting('typography', f);
  const setDensity = (d: DensityOption) => setSetting('density', d);
  const [activeWindow, setActiveWindow] = useState<WindowKey>('about');
  const [timeStr, setTimeStr] = useState('');
  
  // System State flags
  const [isSystemMenuOpen, setIsSystemMenuOpen] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [isShutdown, setIsShutdown] = useState(false);
  const isMuted = !settings.sound; // sound preference persisted in the settings store
  const setIsMuted = (muted: boolean) => setSetting('sound', !muted);
  const [showBootModal, setShowBootModal] = useState(false); // boot handled by <Shell>/<BootSequence>

  // YouTube player states
  const [ytUrl, setYtUrl] = useState('');
  const [ytVideoId, setYtVideoId] = useState('5qap5aO4i9A'); // Default Apple System 7 commercial
  const [tvTab, setTvTab] = useState<'presets' | 'search'>('presets');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const searchVideos = async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      // Query a public invidious proxy node to find video links (no keys required!)
      const res = await fetch(`https://invidious.lunar.icu/api/v1/search?q=${encodeURIComponent(query)}&type=video`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setSearchResults(data.slice(0, 5));
          return;
        }
      }
      
      // Fallback instance if first is offline
      const res2 = await fetch(`https://inv.tux.pizza/api/v1/search?q=${encodeURIComponent(query)}&type=video`);
      if (res2.ok) {
        const data2 = await res2.json();
        if (Array.isArray(data2)) {
          setSearchResults(data2.slice(0, 5));
          return;
        }
      }
    } catch (e) {
      console.warn("Failed invidious search:", e);
      // Mock fallback data to ensure the app never hangs
      const mock = [
        { title: `${query} - Retro LoFi Beats`, videoId: 'jfKfPfyJRdk', author: 'Retro Beats Channel' },
        { title: `${query} - Vaporwave Cyberpunk Station`, videoId: 'hH14d5V5p_U', author: 'Synth Wave' },
        { title: `${query} - Classic OS 7 Commercial`, videoId: '5qap5aO4i9A', author: 'Apple History' }
      ];
      setSearchResults(mock);
    } finally {
      setIsSearching(false);
    }
  };

  // Concept A: Live Telemetry APIs
  const [isOnline, setIsOnline] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(1.0);
  const [isCharging, setIsCharging] = useState(true);
  const [hasBattery, setHasBattery] = useState(false);



  // Concept C: Retro Web Audio Synth
  const playSound = (type: 'click' | 'open' | 'close') => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else if (type === 'open') {
        const now = ctx.currentTime;
        const playChime = (freq: number, start: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.06, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.12);
        };
        playChime(550, now);
        playChime(750, now + 0.06);
      } else if (type === 'close') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      }
    } catch (e) {
      console.warn('Audio blocked:', e);
    }
  };

  const handleBootTrigger = async () => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen permission denied:", err);
    }
    playSound('open');
    setShowBootModal(false);
  };

  // Listen for global keydown or click while boot modal is shown
  useEffect(() => {
    if (!showBootModal) return;

    const handleGlobalInteraction = (e: Event) => {
      e.stopPropagation();
      handleBootTrigger();
    };

    window.addEventListener('keydown', handleGlobalInteraction);
    // Use capture phase to ensure it intercepts any click on the screen
    document.addEventListener('click', handleGlobalInteraction, true);

    return () => {
      window.removeEventListener('keydown', handleGlobalInteraction);
      document.removeEventListener('click', handleGlobalInteraction, true);
    };
  }, [showBootModal, isMuted]);

  // Telemetry APIs Listeners
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setHasBattery(true);
        setBatteryLevel(battery.level);
        setIsCharging(battery.charging);

        const onLevelChange = () => setBatteryLevel(battery.level);
        const onChargingChange = () => setIsCharging(battery.charging);

        battery.addEventListener('levelchange', onLevelChange);
        battery.addEventListener('chargingchange', onChargingChange);

        return () => {
          battery.removeEventListener('levelchange', onLevelChange);
          battery.removeEventListener('chargingchange', onChargingChange);
        };
      });
    }

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);



  // Clock update effect
  useEffect(() => {
    const updateClock = () => {
      setTimeStr(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // Window states
  const [windows, setWindows] = useState<Record<WindowKey, WindowState>>({
    about: { open: false, x: 0, y: 0, z: 1, width: '540px', height: '460px' },
    projects: { open: false, x: 0, y: 0, z: 1, width: '520px', height: '400px' },
    skills: { open: false, x: 0, y: 0, z: 1, width: '460px', height: '350px' },
    experience: { open: false, x: 0, y: 0, z: 1, width: '480px', height: '380px' },
    contact: { open: false, x: 0, y: 0, z: 1, width: '400px', height: '280px' },
    shell: { open: false, x: 0, y: 0, z: 1, width: '500px', height: '360px' },
    artlab: { open: false, x: 0, y: 0, z: 1, width: '550px', height: '420px' },
    youtube: { open: false, x: 0, y: 0, z: 1, width: '560px', height: '440px' },
    snake: { open: false, x: 0, y: 0, z: 1, width: '440px', height: '520px' },
    game2048: { open: false, x: 0, y: 0, z: 1, width: '380px', height: '520px' },
    guestbook: { open: false, x: 0, y: 0, z: 1, width: '420px', height: '460px' },
    quiz: { open: false, x: 0, y: 0, z: 1, width: '460px', height: '460px' },
  });

  type IconKey = 'about' | 'projects' | 'skills' | 'experience' | 'contact' | 'shell' | 'artlab' | 'youtube' | 'snake' | 'game2048' | 'guestbook' | 'quiz';
  interface IconPosition { x: number; y: number; }

  const ICON_ORDER: IconKey[] = ['about', 'projects', 'skills', 'experience', 'contact', 'shell', 'artlab', 'youtube', 'snake', 'game2048', 'guestbook', 'quiz'];

  // Grid-flow layout: fill a column top->bottom, wrap to the next column when
  // it would overflow the viewport (top bar ~32, taskbar ~40).
  const computeIconLayout = (viewportH: number): Record<IconKey, IconPosition> => {
    const stepY = 90;
    const stepX = 96;
    const perCol = Math.max(4, Math.floor((viewportH - 96) / stepY));
    const out = {} as Record<IconKey, IconPosition>;
    ICON_ORDER.forEach((k, i) => {
      out[k] = { x: 24 + Math.floor(i / perCol) * stepX, y: 24 + (i % perCol) * stepY };
    });
    return out;
  };

  const [iconPositions, setIconPositions] = useState<Record<IconKey, IconPosition>>(() => computeIconLayout(900));

  useEffect(() => {
    setIconPositions(computeIconLayout(window.innerHeight));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [topZ, setTopZ] = useState(10);
  const dragInfoRef = useRef<{ key: WindowKey; startX: number; startY: number; startWindowX: number; startWindowY: number } | null>(null);
  const resizeInfoRef = useRef<{ key: WindowKey; startX: number; startY: number; startW: number; startH: number; edge: 'e' | 's' | 'se' } | null>(null);
  const dragIconRef = useRef<{ key: IconKey; startX: number; startY: number; startIconX: number; startIconY: number } | null>(null);
  const hasDraggedRef = useRef(false);
  const [interactingKey, setInteractingKey] = useState<WindowKey | null>(null);
  type SnapZone = { x: number; y: number; w: number; h: number };
  const [snapHint, setSnapHint] = useState<SnapZone | null>(null);
  const snapHintRef = useRef<SnapZone | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [mobileOS, setMobileOS] = useState<'ios' | 'android'>('ios');
  const [openMobileApp, setOpenMobileApp] = useState<WindowKey | null>(null);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobile: device Back button should return to the home grid, not leave the site.
  // Opening an app pushes a history entry; Back (popstate) pops it and closes the app.
  useEffect(() => {
    if (openMobileApp && window.history.state?.mobileApp !== openMobileApp) {
      window.history.pushState({ mobileApp: openMobileApp }, '');
    }
  }, [openMobileApp]);

  useEffect(() => {
    const onPop = () => setOpenMobileApp(null);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const closeMobileApp = () => {
    playSound('close');
    if (window.history.state?.mobileApp) window.history.back();
    else setOpenMobileApp(null);
  };

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // Apply theme, font, and density to the body tag
  useEffect(() => {
    const body = document.body;
    body.classList.remove(
      'font-sans', 'font-serif', 'font-mono',
      'theme-ink', 'theme-paper', 'theme-sepia', 'theme-amber', 'theme-green', 'theme-c64',
      'density-standard', 'density-compact'
    );
    body.classList.add(`font-${font}`);
    body.classList.add(`theme-${theme}`);
    body.classList.add(`density-${density}`);
  }, [font, theme, density]);

  // Center about window on mount
  useEffect(() => {
    const widthNum = parseInt(windows.about.width);
    const heightNum = parseInt(windows.about.height);
    const centerX = Math.max(10, (window.innerWidth - widthNum) / 2);
    const centerY = Math.max(50, (window.innerHeight - heightNum) / 2);
    
    setWindows((prev) => {
      const updated = { ...prev };
      (Object.keys(prev) as WindowKey[]).forEach((k) => {
        updated[k] = { ...prev[k], open: false };
      });
      updated.about = {
        ...prev.about,
        open: true,
        x: centerX,
        y: centerY,
        z: 10,
      };
      return updated;
    });
    setActiveWindow('about');
  }, []);

  const openWindow = (key: WindowKey) => {
    const alreadyOpen = windows[key].open;
    playSound(alreadyOpen ? 'click' : 'open');
    setWindows((prev) => {
      const updated = { ...prev };
      const cur = prev[key];

      if (cur.open) {
        // Re-focus / un-minimize an already-open window; leave others alone.
        updated[key] = { ...cur, minimized: false, z: topZ + 1 };
        return updated;
      }

      // Cascade new windows off the last-focused one so multiple can stack.
      const openCount = (Object.keys(prev) as WindowKey[]).filter((k) => prev[k].open).length;
      const widthNum = parseInt(cur.width) || 450;
      const heightNum = parseInt(cur.height) || 350;
      const baseX = Math.max(10, (window.innerWidth - widthNum) / 2);
      const baseY = Math.max(50, (window.innerHeight - heightNum) / 2);
      const offset = openCount * 28;

      updated[key] = {
        ...cur,
        open: true,
        minimized: false,
        x: Math.min(baseX + offset, window.innerWidth - 120),
        y: Math.min(baseY + offset, window.innerHeight - 120),
        z: topZ + 1,
      };
      return updated;
    });
    setTopZ((z) => z + 1);
    setActiveWindow(key);
  };

  const minimizeWindow = (key: WindowKey) => {
    playSound('close');
    setWindows((prev) => ({ ...prev, [key]: { ...prev[key], minimized: true } }));
  };

  const toggleMaximize = (key: WindowKey) => {
    playSound('click');
    setWindows((prev) => {
      const w = prev[key];
      if (w.maximized && w.prevGeom) {
        return { ...prev, [key]: { ...w, maximized: false, ...w.prevGeom, prevGeom: undefined } };
      }
      return {
        ...prev,
        [key]: {
          ...w,
          maximized: true,
          prevGeom: { x: w.x, y: w.y, width: w.width, height: w.height },
          x: 8,
          y: 40,
          width: `${window.innerWidth - 16}px`,
          height: `${window.innerHeight - 96}px`,
          z: topZ + 1,
        },
      };
    });
    setTopZ((z) => z + 1);
    setActiveWindow(key);
  };

  const closeWindow = (key: WindowKey) => {
    playSound('close');
    setWindows((prev) => ({
      ...prev,
      [key]: { ...prev[key], open: false },
    }));
  };

  const focusWindow = (key: WindowKey) => {
    playSound('click');
    const newZ = topZ + 1;
    setTopZ(newZ);
    setWindows((prev) => ({
      ...prev,
      [key]: { ...prev[key], z: newZ },
    }));
    setActiveWindow(key);
  };

  // `open <app>` command from terminal.sh
  useEffect(() => {
    const onOpen = (e: Event) => {
      const key = (e as CustomEvent).detail as WindowKey;
      if (window.innerWidth < 768) setOpenMobileApp(key);
      else openWindow(key);
    };
    window.addEventListener('zhuday:open-window', onOpen as EventListener);
    return () => window.removeEventListener('zhuday:open-window', onOpen as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drag handler definitions
  const handleMouseDown = (e: React.MouseEvent, key: WindowKey) => {
    focusWindow(key);
    // Only drag on titlebar
    const target = e.target as HTMLElement;
    if (!target.closest('.window-titlebar')) return;
    if (windows[key].maximized) return; // don't drag a maximized window

    dragInfoRef.current = {
      key,
      startX: e.clientX,
      startY: e.clientY,
      startWindowX: windows[key].x,
      startWindowY: windows[key].y,
    };
    setInteractingKey(key);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, key: WindowKey, edge: 'e' | 's' | 'se') => {
    e.stopPropagation();
    e.preventDefault();
    focusWindow(key);
    const w = windows[key];
    resizeInfoRef.current = {
      key,
      startX: e.clientX,
      startY: e.clientY,
      startW: parseInt(w.width) || 450,
      startH: parseInt(w.height) || 350,
      edge,
    };
    setInteractingKey(key);
  };

  const handleIconMouseDown = (e: React.MouseEvent, key: IconKey) => {
    if (e.button !== 0) return;
    hasDraggedRef.current = false;
    dragIconRef.current = {
      key,
      startX: e.clientX,
      startY: e.clientY,
      startIconX: iconPositions[key].x,
      startIconY: iconPositions[key].y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragInfoRef.current) {
        const drag = dragInfoRef.current;
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;

        // Keep at least a sliver of the title bar reachable
        const newX = Math.max(-40, drag.startWindowX + dx);
        const newY = Math.max(34, drag.startWindowY + dy);

        setWindows((prev) => ({
          ...prev,
          [drag.key]: {
            ...prev[drag.key],
            x: newX,
            y: newY,
          },
        }));

        // Edge-snap hint
        const iw = window.innerWidth;
        const ih = window.innerHeight;
        let hint: SnapZone | null = null;
        if (e.clientX <= 6) hint = { x: 0, y: 32, w: Math.round(iw / 2), h: ih - 128 };
        else if (e.clientX >= iw - 6) hint = { x: Math.round(iw / 2), y: 32, w: Math.round(iw / 2), h: ih - 128 };
        else if (e.clientY <= 4) hint = { x: 8, y: 40, w: iw - 16, h: ih - 128 };
        snapHintRef.current = hint;
        setSnapHint(hint);
      } else if (resizeInfoRef.current) {
        const r = resizeInfoRef.current;
        const dx = e.clientX - r.startX;
        const dy = e.clientY - r.startY;
        setWindows((prev) => ({
          ...prev,
          [r.key]: {
            ...prev[r.key],
            width: r.edge !== 's' ? `${Math.max(280, r.startW + dx)}px` : prev[r.key].width,
            height: r.edge !== 'e' ? `${Math.max(180, r.startH + dy)}px` : prev[r.key].height,
          },
        }));
      } else if (dragIconRef.current) {
        const drag = dragIconRef.current;
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;

        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          hasDraggedRef.current = true;
        }

        const newX = Math.max(10, Math.min(window.innerWidth - 80, drag.startIconX + dx));
        const newY = Math.max(40, Math.min(window.innerHeight - 80, drag.startIconY + dy));

        setIconPositions((prev) => ({
          ...prev,
          [drag.key]: { x: newX, y: newY },
        }));
      }
    };

    const handleMouseUp = () => {
      const drag = dragInfoRef.current;
      const zone = snapHintRef.current;
      if (drag && zone) {
        setWindows((prev) => ({
          ...prev,
          [drag.key]: {
            ...prev[drag.key],
            x: zone.x,
            y: zone.y,
            width: `${zone.w}px`,
            height: `${zone.h}px`,
          },
        }));
      }
      dragInfoRef.current = null;
      resizeInfoRef.current = null;
      dragIconRef.current = null;
      snapHintRef.current = null;
      setSnapHint(null);
      setInteractingKey(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const renderMobileAppContent = (key: WindowKey) => {
    if (key === 'snake') {
      return <SnakeGame />;
    }
    if (key === 'game2048') {
      return <Game2048 />;
    }
    if (key === 'guestbook') {
      return <Guestbook />;
    }
    if (key === 'quiz') {
      return <StackQuiz />;
    }
    if (key === 'about') {
      return (
        <div className="space-y-6 reader-content">
          {/* Bio Section */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-foreground">{about.name}</h2>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{about.role}</h3>
            <p className="text-foreground font-medium leading-relaxed">{about.tagline}</p>
            {about.paragraphs.map((p, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed">{p}</p>
            ))}
            <div className="pt-2 flex gap-4 text-xs font-mono">
              <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-foreground hover:underline">
                Download CV <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
          <hr className="border-border" />
          {/* Recent Work */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Recent Work</h3>
            <ul className="space-y-1 text-xs text-muted-foreground leading-relaxed">
              {about.recentWork.map((w, i) => (
                <li key={i} className="flex gap-2"><span className="text-foreground">›</span>{w}</li>
              ))}
            </ul>
          </div>
          <hr className="border-border" />
          {/* Tech stack */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Tech I Work With</h3>
            {Object.entries(about.stack).map(([group, items]) => (
              <div key={group} className="space-y-1">
                <h4 className="text-[9px] font-bold text-muted-foreground uppercase">{group}</h4>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 border border-border bg-card text-foreground rounded">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <hr className="border-border" />
          {/* Skills Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Skills & Technologies</h3>
            {Object.entries(skillsByCategory).map(([category, items]) => (
              <div key={category} className="space-y-1">
                <h4 className="text-[9px] font-bold text-muted-foreground uppercase">{category}</h4>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((s) => (
                    <span key={s.id} className="text-[10px] px-2 py-0.5 border border-border bg-card text-foreground rounded">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <hr className="border-border" />
          {/* Experience Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Experience</h3>
            {achievements.map((a) => (
              <div key={a.id} className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>{a.title}</span>
                  <span className="text-[9px] text-muted-foreground">{a.date}</span>
                </div>
                {a.description && <p className="text-muted-foreground text-xs leading-relaxed">{a.description}</p>}
              </div>
            ))}
          </div>
          <hr className="border-border" />
          {/* Contact Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Get In Touch</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-border pb-1">
                <span className="text-muted-foreground">Email:</span>
                <a href="mailto:zubayerhossain1009@gmail.com" className="flex items-center gap-1 hover:underline"><Mail className="w-3 h-3 shrink-0" /> zubayerhossain1009@gmail.com</a>
              </div>
              <div className="flex justify-between border-b border-border pb-1">
                <span className="text-muted-foreground">GitHub:</span>
                <a href="https://github.com/Uday2027" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline"><Github className="w-3 h-3" /> github.com/Uday2027</a>
              </div>
              <div className="flex justify-between border-b border-border pb-1">
                <span className="text-muted-foreground">LinkedIn:</span>
                <a href="https://www.linkedin.com/in/zubayer-hossain-uday-3481841bb/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 min-w-0 hover:underline text-right max-w-[60%]"><Linkedin className="w-3 h-3 shrink-0" /> <span className="truncate">linkedin.com/...</span></a>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (key === 'projects') {
      return <ProjectList projects={projects} />;
    }
    
    if (key === 'skills') {
      return (
        <div className="space-y-4">
          {Object.entries(skillsByCategory).map(([category, items]) => (
            <div key={category} className="space-y-2 border-b border-border pb-3 last:border-0">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">{category}</h4>
              <div className="flex flex-wrap gap-1.5">
                {items.map((s) => (
                  <span key={s.id} className="text-xs px-2.5 py-1 border border-border bg-card text-muted-foreground rounded">
                    {s.name} ({s.level}%)
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if (key === 'experience') {
      return (
        <div className="space-y-4">
          {achievements.map((a) => (
            <div key={a.id} className="space-y-1 border-b border-border pb-3 last:border-0">
              <div className="flex justify-between items-baseline">
                <h4 className="text-xs font-bold text-foreground">{a.title}</h4>
                <span className="text-[10px] text-muted-foreground">{a.date}</span>
              </div>
              {a.description && <p className="text-muted-foreground leading-relaxed">{a.description}</p>}
            </div>
          ))}
        </div>
      );
    }
    
    if (key === 'contact') {
      return (
        <div className="space-y-4">
          <p className="text-muted-foreground text-xs leading-relaxed">
            I am always open to remote work, consultancy, and full-time contract developer placements. Reach out directly.
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="text-muted-foreground">Email:</span>
              <a href="mailto:zubayerhossain1009@gmail.com" className="text-foreground hover:underline flex items-center gap-1"><Mail className="w-3 h-3 shrink-0" /> zubayerhossain1009@gmail.com</a>
            </div>
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="text-muted-foreground">GitHub:</span>
              <a href="https://github.com/Uday2027" target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline flex items-center gap-1"><Github className="w-3 h-3" /> github.com/Uday2027</a>
            </div>
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="text-muted-foreground">LinkedIn:</span>
              <a href="https://www.linkedin.com/in/zubayer-hossain-uday-3481841bb/" target="_blank" rel="noopener noreferrer" className="text-foreground flex items-center gap-1 min-w-0 hover:underline max-w-[65%] text-right"><Linkedin className="w-3 h-3 shrink-0" /> <span className="truncate">linkedin.com/in/zubayer-hossain-uday-3481841bb</span></a>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span className="text-foreground">{about.location}</span>
            </div>
          </div>
        </div>
      );
    }
    
    if (key === 'shell') {
      return (
        <div className="h-[75vh] w-full flex flex-col">
          <FloatingTerminal projects={projects} skills={skills} achievements={achievements} inlineEmbed={true} />
        </div>
      );
    }
    
    if (key === 'artlab') {
      return <AsciiArtLab />;
    }
    
    if (key === 'youtube') {
      return (
        <div className="space-y-4 font-mono text-xs flex flex-col h-full bg-neutral-950 p-2 border border-foreground rounded">
          <div className="relative aspect-video w-full border border-foreground bg-black overflow-hidden rounded">
            {ytVideoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytVideoId}?autoplay=1&mute=${isMuted ? 1 : 0}`}
                title="Retro Channel Receiver"
                className="absolute inset-0 w-full h-full grayscale brightness-90 contrast-110"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black text-red-500 font-bold uppercase animate-pulse">
                No signal ...
              </div>
            )}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%]" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 min-h-[140px] pt-1">
            <div className="font-bold border-b border-border pb-1 uppercase tracking-widest text-[10px] text-neutral-400">Presets & Channels</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => { setYtVideoId('5qap5aO4i9A'); playSound('open'); }}
                className={`py-1.5 px-2 border rounded text-left transition-colors cursor-pointer text-[10px] ${
                  ytVideoId === '5qap5aO4i9A' ? 'bg-foreground text-background font-bold' : 'hover:bg-muted text-foreground'
                }`}
              >
                CH 1: Apple System 7
              </button>
              <button
                onClick={() => { setYtVideoId('hH14d5V5p_U'); playSound('open'); }}
                className={`py-1.5 px-2 border rounded text-left transition-colors cursor-pointer text-[10px] ${
                  ytVideoId === 'hH14d5V5p_U' ? 'bg-foreground text-background font-bold' : 'hover:bg-muted text-foreground'
                }`}
              >
                CH 2: Retro Tech
              </button>
              <button
                onClick={() => { setYtVideoId('jfKfPfyJRdk'); playSound('open'); }}
                className={`py-1.5 px-2 border rounded text-left transition-colors cursor-pointer text-[10px] ${
                  ytVideoId === 'jfKfPfyJRdk' ? 'bg-foreground text-background font-bold' : 'hover:bg-muted text-foreground'
                }`}
              >
                CH 3: Cyber Lofi
              </button>
              <button
                onClick={() => { setYtVideoId('a_t71-55vxs'); playSound('open'); }}
                className={`py-1.5 px-2 border rounded text-left transition-colors cursor-pointer text-[10px] ${
                  ytVideoId === 'a_t71-55vxs' ? 'bg-foreground text-background font-bold' : 'hover:bg-muted text-foreground'
                }`}
              >
                CH 4: Vaporwave
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-mono relative overflow-hidden select-none">
        
        {/* Mobile Top System Header */}
        <header className="h-8 border-b border-border bg-card flex items-center justify-between px-4 shrink-0 text-[10px] uppercase font-bold tracking-wider z-50 relative">
          {/* Left Corner: Time + Status Dot */}
          <div className="flex items-center gap-2 z-10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-foreground font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
          </div>

          {/* Center / Middle: User Name */}
          <span className="absolute left-1/2 -translate-x-1/2 text-foreground font-bold whitespace-nowrap">
            Zubayer Hossain Uday
          </span>

          {/* Right Corner: Telemetries + Settings */}
          <div className="flex items-center gap-2 text-muted-foreground z-10">
            <Wifi className="w-3 h-3 text-foreground" />
            <Battery className="w-4 h-4 text-foreground" />
            <button
              onClick={() => setMobileSettingsOpen((v) => !v)}
              aria-label="Display settings"
              className={`p-0.5 rounded ${mobileSettingsOpen ? 'bg-foreground text-background' : 'text-foreground'}`}
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Mobile display-settings panel */}
        {mobileSettingsOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMobileSettingsOpen(false)} />
            <div className="absolute right-2 top-9 z-50 w-60 rounded-lg border border-border bg-neutral-950 p-3 font-mono text-[10px] text-white shadow-2xl space-y-3">
              {([
                ['Page Tone', ['ink', 'paper', 'sepia', 'amber', 'green', 'c64'], settings.tone, (v: string) => setTheme(v as ThemeOption)],
                ['Typography', ['sans', 'serif', 'mono'], settings.typography, (v: string) => setFont(v as FontOption)],
                ['Density', ['standard', 'compact'], settings.density, (v: string) => setDensity(v as DensityOption)],
                ['CRT', ['off', 'subtle', 'full'], settings.crt, (v: string) => setSetting('crt', v as Crt)],
              ] as [string, string[], string, (v: string) => void][]).map(([label, opts, current, set]) => (
                <div key={label} className="space-y-1">
                  <div className="text-[9px] uppercase tracking-widest text-neutral-500">{label}</div>
                  <div className="flex flex-wrap gap-1">
                    {opts.map((o) => (
                      <button
                        key={o}
                        onClick={() => { set(o); playSound('click'); }}
                        className={`px-2 py-0.5 rounded border capitalize ${current === o ? 'bg-white text-black border-white' : 'border-white/20 text-white hover:border-white/50'}`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Mobile Viewport / Main Container */}
        <div className={`flex-1 relative bg-neutral-950/5 overflow-y-auto ${!openMobileApp ? 'p-4' : 'p-0'}`}>
          {!openMobileApp ? (
            <div className="space-y-6">
              {/* Home Screen App Grid */}
              <div className="grid grid-cols-3 gap-x-4 gap-y-6 pt-4 justify-items-center">
                {[
                  { key: 'about', label: 'about_me.txt', Icon: User },
                  { key: 'projects', label: 'projects.dir', Icon: Folder },
                  { key: 'skills', label: 'skills.stack', Icon: Sliders },
                  { key: 'experience', label: 'experience.dir', Icon: Folder },
                  { key: 'contact', label: 'contact.card', Icon: Mail },
                  { key: 'shell', label: 'terminal.sh', Icon: TerminalIcon },
                  { key: 'artlab', label: 'art_lab.app', Icon: ImageIcon },
                  { key: 'youtube', label: 'retro_tv.app', Icon: Tv },
                  { key: 'snake', label: 'snake.game', Icon: Gamepad2 },
                  { key: 'game2048', label: '2048.game', Icon: Gamepad2 },
                  { key: 'guestbook', label: 'guestbook.txt', Icon: BookText },
                  { key: 'quiz', label: 'stack.quiz', Icon: HelpCircle },
                ].map((app) => (
                  <div
                    key={app.key}
                    onClick={() => { setOpenMobileApp(app.key as WindowKey); playSound('open'); }}
                    className="flex flex-col items-center gap-1.5 w-20 cursor-pointer group text-center select-none active:scale-95 transition-transform"
                  >
                    <div className="w-12 h-12 border border-border bg-card flex items-center justify-center rounded-lg shadow-md transition-colors group-hover:bg-foreground group-hover:text-background">
                      <app.Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono text-foreground px-1 bg-background/50 rounded shadow-xs break-all leading-normal">
                      {app.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Compact "available" pill + quick links */}
              <div className="mt-8 mx-2 flex flex-col items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-foreground/40 bg-card px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Available for work
                </div>
                <p className="text-center font-mono text-[10px] leading-relaxed text-muted-foreground">
                  Zubayer Hossain Uday · Full Stack Software Engineer
                  <br />
                  Tap an app above to explore.
                </p>
                <div className="flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
                  <a href="mailto:zubayerhossain1009@gmail.com" aria-label="Email" className="hover:text-foreground">
                    <Mail className="h-4 w-4" />
                  </a>
                  <a href="https://github.com/Uday2027" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-foreground">
                    <Github className="h-4 w-4" />
                  </a>
                  <a href="https://www.linkedin.com/in/zubayer-hossain-uday-3481841bb/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-foreground">
                    <Linkedin className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            /* Opened Application view — zooms in from the tapped icon */
            <div
              key={openMobileApp}
              className="absolute inset-0 flex flex-col bg-background overflow-hidden font-mono mobile-app-in"
            >
              {/* App Header */}
              <div className="h-9 bg-neutral-900/10 border-b border-foreground flex items-center justify-between px-3 select-none shrink-0">
                <button
                  onClick={closeMobileApp}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground active:opacity-60"
                  title="Back"
                >
                  <span className="text-sm leading-none">‹</span> Home
                </button>
                <span className="text-xs font-semibold tracking-wider text-foreground capitalize">
                  {openMobileApp === 'about' ? 'about_me.txt' : openMobileApp}
                </span>
                <span className="w-10" />
              </div>
              {/* App Body */}
              <div className={`flex-1 overflow-y-auto p-4 select-text bg-background text-foreground text-xs leading-relaxed window-body ${openMobileApp !== 'shell' ? 'reader-content' : 'font-mono'}`}>
                {renderMobileAppContent(openMobileApp)}
              </div>
            </div>
          )}
        </div>

        {/* Bottom home indicator — tap / swipe up to go home */}
        <div
          onClick={() => { if (openMobileApp) closeMobileApp(); }}
          onTouchEnd={(e) => {
            const t = e.changedTouches[0];
            if (t && openMobileApp) closeMobileApp();
          }}
          className="shrink-0 h-8 flex items-center justify-center bg-card border-t border-border z-50"
        >
          <span className="h-1 w-28 rounded-full bg-foreground/40" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col select-none overflow-hidden relative font-sans transition-colors duration-300">
      
      {/* ── TOP SYSTEM MENU BAR ── */}
      <header className="fixed top-0 left-0 right-0 h-8 border-b border-border bg-card flex items-center justify-between px-4 z-[9999] text-xs font-mono select-none">
        {/* LEFT SIDE: Customizer Options */}
        <div className="flex items-center gap-4">
          {/* Dropdown menus (styled as clean text dropdowns) */}
          <div className="hidden sm:flex items-center gap-4 text-muted-foreground">
            <span className="h-3 w-px bg-border" />
            <div className="relative group py-1">
              <span className="hover:text-foreground cursor-pointer">Page Tone</span>
              <div className="absolute left-0 mt-1 hidden group-hover:block bg-neutral-900 border border-white/5 rounded shadow-2xl p-1 w-28 z-[10001]">
                {(['ink', 'paper', 'sepia', 'amber', 'green', 'c64'] as ThemeOption[]).map((t) => (
                  <div
                    key={t}
                    onClick={() => setTheme(t)}
                    className="px-3 py-1 hover:bg-white hover:text-black cursor-pointer rounded text-[10px] capitalize text-white"
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative group py-1">
              <span className="hover:text-foreground cursor-pointer">Typography</span>
              <div className="absolute left-0 mt-1 hidden group-hover:block bg-neutral-900 border border-white/5 rounded shadow-2xl p-1 w-32 z-[10001]">
                {(['sans', 'serif', 'mono'] as FontOption[]).map((f) => (
                  <div
                    key={f}
                    onClick={() => setFont(f)}
                    className="px-3 py-1 hover:bg-white hover:text-black cursor-pointer rounded text-[10px] capitalize text-white"
                  >
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative group py-1">
              <span className="hover:text-foreground cursor-pointer">Density</span>
              <div className="absolute left-0 mt-1 hidden group-hover:block bg-neutral-900 border border-white/5 rounded shadow-2xl p-1 w-28 z-[10001]">
                {(['standard', 'compact'] as DensityOption[]).map((d) => (
                  <div
                    key={d}
                    onClick={() => setDensity(d)}
                    className="px-3 py-1 hover:bg-white hover:text-black cursor-pointer rounded text-[10px] capitalize text-white"
                  >
                    {d}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative group py-1">
              <span className="hover:text-foreground cursor-pointer">CRT</span>
              <div className="absolute left-0 mt-1 hidden group-hover:block bg-neutral-900 border border-white/5 rounded shadow-2xl p-1 w-28 z-[10001]">
                {(['off', 'subtle', 'full'] as Crt[]).map((c) => (
                  <div
                    key={c}
                    onClick={() => { setSetting('crt', c); playSound('click'); }}
                    className={`px-3 py-1 hover:bg-white hover:text-black cursor-pointer rounded text-[10px] capitalize ${settings.crt === c ? 'text-white bg-white/10' : 'text-white'}`}
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER SECTION: Name and Social Shortcuts */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4 z-[9998] font-mono text-[10px]">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => openWindow('about')}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-foreground uppercase tracking-wider hover:text-emerald-400 transition-colors">
              Zubayer Hossain Uday
            </span>
          </div>
          <span className="h-3 w-px bg-border hidden md:inline" />
          <div className="hidden md:flex items-center gap-3 text-muted-foreground">
            <a href="mailto:zubayerhossain1009@gmail.com" aria-label="Email" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Mail className="w-3 h-3" /> Email
            </a>
            <a href="https://github.com/Uday2027" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Github className="w-3 h-3" /> GitHub
            </a>
            <a href="https://www.linkedin.com/in/zubayer-hossain-uday-3481841bb/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Linkedin className="w-3 h-3" /> LinkedIn
            </a>
          </div>
        </div>

        {/* RIGHT SIDE: Search Button & OS Version */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
            className="flex items-center gap-1 bg-background hover:bg-foreground hover:text-background border border-border px-3 py-0.5 rounded cursor-pointer transition-colors text-[10px] uppercase font-bold tracking-wider"
          >
            <span>Search ⌘K</span>
          </button>
          
          <span className="h-3 w-px bg-border hidden sm:inline" />
          <span className="text-[10px] text-muted-foreground hidden sm:inline">
            System 20.27
          </span>
        </div>
      </header>

      {/* ── DESKTOP AREA ── */}
      <div className="flex-1 mt-8 p-6 relative overflow-hidden bg-neutral-950/5">
        
        {/* Desktop grid layout for Draggable Icons */}
        {(Object.keys(iconPositions) as IconKey[]).map((key) => {
          const pos = iconPositions[key];

          let iconName = '';
          let IconComponent = User;

          if (key === 'about') { iconName = 'about_me.txt'; IconComponent = User; }
          else if (key === 'projects') { iconName = 'projects.dir'; IconComponent = Folder; }
          else if (key === 'skills') { iconName = 'skills.stack'; IconComponent = Sliders; }
          else if (key === 'experience') { iconName = 'experience.dir'; IconComponent = Folder; }
          else if (key === 'contact') { iconName = 'contact.card'; IconComponent = Mail; }
          else if (key === 'shell') { iconName = 'terminal.sh'; IconComponent = TerminalIcon; }
          else if (key === 'artlab') { iconName = 'art_lab.app'; IconComponent = ImageIcon; }
          else if (key === 'youtube') { iconName = 'retro_tv.app'; IconComponent = Tv; }
          else if (key === 'snake') { iconName = 'snake.game'; IconComponent = Gamepad2; }
          else if (key === 'game2048') { iconName = '2048.game'; IconComponent = Gamepad2; }
          else if (key === 'guestbook') { iconName = 'guestbook.txt'; IconComponent = BookText; }
          else if (key === 'quiz') { iconName = 'stack.quiz'; IconComponent = HelpCircle; }

          return (
            <div
              key={key}
              onMouseDown={(e) => handleIconMouseDown(e, key)}
              onClick={() => {
                if (!hasDraggedRef.current) {
                  openWindow(key);
                }
              }}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
              }}
              className="flex flex-col items-center gap-1.5 w-20 cursor-pointer group text-center select-none z-10"
            >
              <div className="w-12 h-12 border border-border bg-card group-hover:bg-foreground group-hover:text-background flex items-center justify-center rounded-lg transition-colors duration-200 shadow-md">
                <IconComponent className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono text-foreground px-1 bg-background/50 rounded shadow-xs break-all">
                {iconName}
              </span>
            </div>
          );
        })}

        {/* ── DESKTOP WINDOWS RENDERER ── */}
        {(Object.keys(windows) as WindowKey[]).map((key) => {
          const w = windows[key];
          if (!w.open || w.minimized) return null;

          const isActive = activeWindow === key;
          const isInteracting = interactingKey === key;

          return (
            <div
              key={key}
              onMouseDown={(e) => handleMouseDown(e, key)}
              style={{
                position: 'absolute',
                left: `${w.x}px`,
                top: `${w.y}px`,
                zIndex: w.z,
                width: w.width,
                height: w.height,
                transition: isInteracting
                  ? 'none'
                  : 'left 0.18s cubic-bezier(.2,.9,.2,1), top 0.18s cubic-bezier(.2,.9,.2,1), width 0.18s cubic-bezier(.2,.9,.2,1), height 0.18s cubic-bezier(.2,.9,.2,1)',
              }}
              className={`flex flex-col border border-foreground bg-background rounded-lg shadow-2xl overflow-hidden font-mono max-w-[98vw] ${
                w.maximized ? '' : 'max-h-[92vh]'
              } ${isActive ? 'ring-2 ring-foreground/20' : 'opacity-90'}`}
            >
              {/* Window Titlebar */}
              <div
                className="h-8 bg-neutral-900/10 border-b border-foreground flex items-center justify-between px-3 select-none cursor-move window-titlebar shrink-0"
                onDoubleClick={() => toggleMaximize(key)}
              >
                <div className="flex items-center gap-2">
                  {/* Traffic lights: close / minimize / maximize */}
                  <button
                    onClick={() => closeWindow(key)}
                    className="w-5 h-5 border border-foreground rounded bg-background flex items-center justify-center text-[10px] font-bold hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                    title="Close"
                  >
                    ✕
                  </button>
                  <button
                    onClick={() => minimizeWindow(key)}
                    className="w-5 h-5 border border-foreground rounded bg-background flex items-center justify-center text-[10px] font-bold hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                    title="Minimize"
                  >
                    –
                  </button>
                  <button
                    onClick={() => toggleMaximize(key)}
                    className="w-5 h-5 border border-foreground rounded bg-background flex items-center justify-center text-[9px] font-bold hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                    title={w.maximized ? 'Restore' : 'Maximize'}
                  >
                    {w.maximized ? '❐' : '□'}
                  </button>
                  {/* Title */}
                  <span className="text-xs font-semibold tracking-wider text-foreground">
                    {key === 'about' && 'about_me.txt'}
                    {key === 'projects' && 'projects.dir'}
                    {key === 'skills' && 'skills.stack'}
                    {key === 'experience' && 'experience.dir'}
                    {key === 'contact' && 'contact.card'}
                    {key === 'shell' && 'terminal.sh'}
                    {key === 'artlab' && 'art_lab.app'}
                    {key === 'youtube' && 'retro_tv.app'}
                    {key === 'snake' && 'snake.game'}
                    {key === 'game2048' && '2048.game'}
                    {key === 'guestbook' && 'guestbook.txt'}
                    {key === 'quiz' && 'stack.quiz'}
                  </span>
                </div>
                {/* Visual drag indicators */}
                <div className="flex flex-col gap-[2px] w-12 py-1 select-none pointer-events-none opacity-40">
                  <div className="h-[1px] bg-foreground w-full" />
                  <div className="h-[1px] bg-foreground w-full" />
                  <div className="h-[1px] bg-foreground w-full" />
                </div>
              </div>

              {/* Window Body Content Area */}
              <div className={`flex-1 overflow-y-auto p-5 select-text bg-background text-foreground text-xs leading-relaxed window-body ${key !== 'shell' ? 'reader-content' : 'font-mono'}`}>
                {key === 'about' && (
                  <div className="space-y-8">
                    {/* Bio Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-muted-foreground uppercase font-medium">{about.status}</span>
                      </div>
                      <h2 className="text-lg font-bold text-foreground font-mono">{about.name}</h2>
                      <h3 className="text-xs font-bold text-muted-foreground font-mono uppercase tracking-wider">{about.role}</h3>
                      <p className="text-foreground font-medium leading-relaxed">{about.tagline}</p>
                      {about.paragraphs.map((p, i) => (
                        <p key={i} className="text-muted-foreground leading-relaxed">{p}</p>
                      ))}
                      <div className="pt-2 flex gap-4 text-xs font-mono">
                        <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-foreground hover:underline">
                          Download CV <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <hr className="border-border" />

                    {/* Recent Work */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold font-mono text-foreground uppercase tracking-widest">Recent Work</h3>
                      <ul className="space-y-1 text-xs text-muted-foreground leading-relaxed">
                        {about.recentWork.map((w, i) => (
                          <li key={i} className="flex gap-2"><span className="text-foreground">›</span>{w}</li>
                        ))}
                      </ul>
                    </div>

                    <hr className="border-border" />

                    {/* Products built */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold font-mono text-foreground uppercase tracking-widest">Products I've Built</h3>
                      <ul className="space-y-1 text-xs text-muted-foreground leading-relaxed">
                        {about.products.map((w, i) => (
                          <li key={i} className="flex gap-2"><span className="text-foreground">›</span>{w}</li>
                        ))}
                      </ul>
                    </div>

                    <hr className="border-border" />

                    {/* Tech stack groups */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold font-mono text-foreground uppercase tracking-widest">Tech I Work With</h3>
                      {Object.entries(about.stack).map(([group, items]) => (
                        <div key={group} className="space-y-1.5">
                          <h4 className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider">{group}</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {items.map((t) => (
                              <span key={t} className="text-[11px] px-2 py-0.5 border border-border bg-card text-foreground rounded font-mono">{t}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <hr className="border-border" />

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Outside of work: {about.interests.join(', ')}. {about.closing}
                    </p>

                    <hr className="border-border" />

                    {/* Skills Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold font-mono text-foreground uppercase tracking-widest">Skills & Technologies</h3>
                      {Object.keys(skillsByCategory).length === 0 ? (
                        <p className="text-muted-foreground">No skills loaded.</p>
                      ) : (
                        <div className="space-y-4">
                          {Object.entries(skillsByCategory).map(([category, items]) => (
                            <div key={category} className="space-y-1.5">
                              <h4 className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider">{category}</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {items.map((s) => (
                                  <span key={s.id} className="text-[11px] px-2 py-0.5 border border-border bg-card text-foreground rounded font-mono">
                                    {s.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <hr className="border-border" />

                    {/* Experience Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold font-mono text-foreground uppercase tracking-widest">Experience & History</h3>
                      {achievements.length === 0 ? (
                        <p className="text-muted-foreground">No experience milestones.</p>
                      ) : (
                        <div className="space-y-4">
                          {achievements.map((a) => (
                            <div key={a.id} className="space-y-1">
                              <div className="flex justify-between items-baseline font-mono text-xs">
                                <h4 className="font-bold text-foreground">{a.title}</h4>
                                <span className="text-[10px] text-muted-foreground">{a.date}</span>
                              </div>
                              {a.description && (
                                <p className="text-muted-foreground text-xs leading-relaxed">{a.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <hr className="border-border" />

                    {/* Projects Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold font-mono text-foreground uppercase tracking-widest">Featured Projects</h3>
                      {projects.length === 0 ? (
                        <p className="text-muted-foreground">No projects loaded.</p>
                      ) : (
                        <div className="space-y-4">
                          {projects.map((p) => (
                            <div key={p.id} className="space-y-1">
                              <div className="flex justify-between items-baseline font-mono text-xs">
                                <h4 className="font-bold text-foreground">{p.title}</h4>
                                <div className="flex items-center gap-2 text-[10px]">
                                  {p.githubUrl && (
                                    <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub repository" className="text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                                      <Github className="w-2.5 h-2.5" /> GitHub
                                    </a>
                                  )}
                                  {p.liveUrl && (
                                    <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                                      Live <ArrowUpRight className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                </div>
                              </div>
                              <p className="text-muted-foreground text-xs leading-relaxed">{p.description}</p>
                              <p className="text-[10px] text-muted-foreground/60 font-mono">Tags: {p.tags}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <hr className="border-border" />

                    {/* Contact Section */}
                    <div className="space-y-4 font-mono">
                      <h3 className="text-sm font-bold text-foreground">Get In Touch</h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between border-b border-border pb-1.5">
                          <span className="text-muted-foreground">Email:</span>
                          <a href="mailto:zubayerhossain1009@gmail.com" className="text-foreground hover:underline flex items-center gap-1"><Mail className="w-3 h-3 shrink-0" /> zubayerhossain1009@gmail.com</a>
                        </div>
                        <div className="flex justify-between border-b border-border pb-1.5">
                          <span className="text-muted-foreground">GitHub:</span>
                          <a href="https://github.com/Uday2027" target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline flex items-center gap-1">
                            <Github className="w-3 h-3" /> github.com/Uday2027 <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="flex justify-between border-b border-border pb-1.5">
                          <span className="text-muted-foreground">LinkedIn:</span>
                          <a href="https://www.linkedin.com/in/zubayer-hossain-uday-3481841bb/" target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline flex items-center gap-1">
                            <Linkedin className="w-3 h-3" /> linkedin.com/in/zubayer-hossain-uday-3481841bb <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location:</span>
                          <span className="text-foreground">{about.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {key === 'projects' && (
                  <div className="space-y-4">
                    <ProjectList projects={projects} />
                  </div>
                )}

                {key === 'skills' && (
                  <div className="space-y-6">
                    {Object.keys(skillsByCategory).length === 0 ? (
                      <p className="text-muted-foreground">No skills loaded.</p>
                    ) : (
                      Object.entries(skillsByCategory).map(([category, items]) => (
                        <div key={category} className="space-y-2 border-b border-border pb-4 last:border-0">
                          <h4 className="text-xs font-bold font-mono text-foreground uppercase tracking-widest">{category}</h4>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {items.map((s) => (
                              <span key={s.id} className="text-xs px-2.5 py-1 border border-border bg-card text-muted-foreground rounded">
                                {s.name} ({s.level}%)
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {key === 'experience' && (
                  <div className="space-y-6">
                    {achievements.length === 0 ? (
                      <p className="text-muted-foreground">No experience milestones.</p>
                    ) : (
                      achievements.map((a) => (
                        <div key={a.id} className="space-y-1.5 border-b border-border pb-4 last:border-0">
                          <div className="flex justify-between items-baseline font-mono">
                            <h4 className="text-xs font-bold text-foreground">{a.title}</h4>
                            <span className="text-[10px] text-muted-foreground">{a.date}</span>
                          </div>
                          {a.description && (
                            <p className="text-muted-foreground leading-relaxed">{a.description}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {key === 'contact' && (
                  <div className="space-y-4 font-mono">
                    <h3 className="text-sm font-bold text-foreground">Get In Touch</h3>
                    <p className="text-muted-foreground font-sans text-xs">
                      I am always open to remote work, consultancy, and full-time contract developer placements. Reach out directly.
                    </p>
                    <div className="space-y-2 pt-2 text-xs">
                      <div className="flex justify-between border-b border-border pb-1.5">
                        <span className="text-muted-foreground">Email:</span>
                        <a href="mailto:zubayerhossain1009@gmail.com" className="text-foreground hover:underline flex items-center gap-1"><Mail className="w-3 h-3 shrink-0" /> zubayerhossain1009@gmail.com</a>
                      </div>
                      <div className="flex justify-between border-b border-border pb-1.5">
                        <span className="text-muted-foreground">GitHub:</span>
                        <a href="https://github.com/Uday2027" target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline flex items-center gap-1">
                          <Github className="w-3 h-3" /> github.com/Uday2027 <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex justify-between border-b border-border pb-1.5">
                        <span className="text-muted-foreground">LinkedIn:</span>
                        <a href="https://www.linkedin.com/in/zubayer-hossain-uday-3481841bb/" target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline flex items-center gap-1">
                          <Linkedin className="w-3 h-3" /> linkedin.com/in/zubayer-hossain-uday-3481841bb <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="text-foreground">{about.location}</span>
                      </div>
                    </div>
                  </div>
                )}

                {key === 'shell' && (
                  <div className="h-full flex flex-col font-mono text-xs">
                    <FloatingTerminal projects={projects} skills={skills} achievements={achievements} inlineEmbed={true} />
                  </div>
                )}

                {key === 'artlab' && (
                  <AsciiArtLab />
                )}

                {key === 'snake' && <SnakeGame />}
                {key === 'game2048' && <Game2048 />}
                {key === 'guestbook' && <Guestbook />}
                {key === 'quiz' && <StackQuiz />}

                {key === 'youtube' && (
                  <div className="space-y-4 font-mono text-xs flex flex-col h-full bg-neutral-950 p-2 border border-foreground rounded">
                    {/* Retro TV Screen Bezel */}
                    <div className="relative border border-foreground bg-black rounded p-1 flex flex-col items-center justify-center overflow-hidden shrink-0">
                      {ytVideoId ? (
                        <iframe
                          width="100%"
                          height="230px"
                          src={`https://www.youtube.com/embed/${ytVideoId}?autoplay=1`}
                          title="Retro TV Youtube Player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-[230px] rounded"
                        ></iframe>
                      ) : (
                        <div className="w-full h-[230px] flex items-center justify-center text-neutral-600 bg-neutral-950 font-mono text-[10px] uppercase">
                          No Video Playing (Static Noise)
                        </div>
                      )}
                      {/* Scanline grid texture overlay */}
                      <div className="absolute inset-0 pointer-events-none bg-radial-gradient opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%]" />
                    </div>

                    {/* TV Controls */}
                    <div className="space-y-3 bg-neutral-900/5 p-3 border border-border rounded flex-1 flex flex-col justify-between overflow-hidden">
                      {/* Tab buttons */}
                      <div className="flex border-b border-border pb-1 shrink-0">
                        <button
                          onClick={() => { setTvTab('presets'); playSound('click'); }}
                          className={`flex-1 text-center py-1 text-[9px] uppercase font-bold transition-colors ${
                            tvTab === 'presets' ? 'text-foreground border-b border-foreground' : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Presets & URL
                        </button>
                        <button
                          onClick={() => { setTvTab('search'); playSound('click'); }}
                          className={`flex-1 text-center py-1 text-[9px] uppercase font-bold transition-colors ${
                            tvTab === 'search' ? 'text-foreground border-b border-foreground' : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Search Videos
                        </button>
                      </div>

                      {tvTab === 'presets' ? (
                        <div className="space-y-3 flex-1 flex flex-col justify-between">
                          {/* Paste Custom URL */}
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-muted-foreground">Channel Input / Paste URL</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Paste YouTube watch URL..."
                                value={ytUrl}
                                onChange={(e) => setYtUrl(e.target.value)}
                                className="flex-grow bg-background border border-border rounded px-2 py-1 text-[10px] text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                              />
                              <button
                                onClick={() => {
                                  const id = extractYoutubeId(ytUrl);
                                  if (id) {
                                    setYtVideoId(id);
                                    playSound('click');
                                    toast.success("Loading channel signal...");
                                  } else {
                                    toast.error("Invalid YouTube URL");
                                  }
                                }}
                                className="bg-foreground text-background px-3 py-1 text-[10px] rounded hover:bg-background hover:text-foreground border border-foreground font-bold cursor-pointer transition-colors"
                              >
                                TUNE
                              </button>
                            </div>
                          </div>

                          {/* Preset Channels */}
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-bold text-muted-foreground">Preset Channels</span>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              <button
                                onClick={() => { setYtVideoId('5qap5aO4i9A'); playSound('click'); }}
                                className={`px-2 py-0.5 border text-[9px] rounded transition-colors cursor-pointer ${
                                  ytVideoId === '5qap5aO4i9A' ? 'bg-foreground text-background border-foreground font-semibold' : 'border-border text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                CH 1: Apple System 7
                              </button>
                              <button
                                onClick={() => { setYtVideoId('jfKfPfyJRdk'); playSound('click'); }}
                                className={`px-2 py-0.5 border text-[9px] rounded transition-colors cursor-pointer ${
                                  ytVideoId === 'jfKfPfyJRdk' ? 'bg-foreground text-background border-foreground font-semibold' : 'border-border text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                CH 2: Lofi Girl Live
                              </button>
                              <button
                                onClick={() => { setYtVideoId('hH14d5V5p_U'); playSound('click'); }}
                                className={`px-2 py-0.5 border text-[9px] rounded transition-colors cursor-pointer ${
                                  ytVideoId === 'hH14d5V5p_U' ? 'bg-foreground text-background border-foreground font-semibold' : 'border-border text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                CH 3: Vaporwave Beats
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 flex-1 flex flex-col justify-between overflow-hidden">
                          <div className="flex gap-2 shrink-0">
                            <input
                              type="text"
                              placeholder="Search YouTube videos..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  searchVideos(searchQuery);
                                }
                              }}
                              className="flex-grow bg-background border border-border rounded px-2 py-1 text-[10px] text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                            />
                            <button
                              onClick={() => searchVideos(searchQuery)}
                              className="bg-foreground text-background px-3 py-1 text-[10px] rounded hover:bg-background hover:text-foreground border border-foreground font-bold cursor-pointer transition-colors"
                              disabled={isSearching}
                            >
                              {isSearching ? '...' : 'FIND'}
                            </button>
                          </div>

                          {/* Search Results List */}
                          <div className="flex-1 overflow-y-auto max-h-[85px] border border-border rounded bg-neutral-950/20 p-1 space-y-1 scrollbar-thin">
                            {searchResults.length === 0 ? (
                              <div className="text-[9px] text-neutral-500 text-center py-4">
                                {isSearching ? 'Searching signals...' : 'Search for video signals above.'}
                              </div>
                            ) : (
                              searchResults.map((vid: any) => (
                                <div
                                  key={vid.videoId}
                                  onClick={() => {
                                    setYtVideoId(vid.videoId);
                                    playSound('open');
                                    toast.success(`Tuned to channel: ${vid.title.substring(0, 20)}...`);
                                  }}
                                  className="flex items-center gap-2 p-1 hover:bg-foreground hover:text-background rounded cursor-pointer transition-colors text-[9px]"
                                >
                                  {/* Thumbnail */}
                                  <img
                                    src={`https://img.youtube.com/vi/${vid.videoId}/default.jpg`}
                                    alt=""
                                    className="w-8 h-6 border border-border object-cover rounded bg-black shrink-0"
                                  />
                                  <div className="truncate flex-1">
                                    <div className="font-bold truncate">{vid.title}</div>
                                    <div className="opacity-60 truncate">{vid.author || 'YouTube Channel'}</div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Resize handles (hidden while maximized) */}
              {!w.maximized && (
                <>
                  <div
                    onMouseDown={(e) => handleResizeMouseDown(e, key, 'e')}
                    className="absolute top-8 right-0 bottom-3 w-1.5 cursor-ew-resize"
                  />
                  <div
                    onMouseDown={(e) => handleResizeMouseDown(e, key, 's')}
                    className="absolute left-3 right-3 bottom-0 h-1.5 cursor-ns-resize"
                  />
                  <div
                    onMouseDown={(e) => handleResizeMouseDown(e, key, 'se')}
                    className="absolute right-0 bottom-0 w-4 h-4 cursor-nwse-resize"
                    title="Resize"
                  >
                    <div className="absolute right-1 bottom-1 w-2 h-2 border-b border-r border-foreground/50" />
                  </div>
                </>
              )}
            </div>
          );
        })}

        {/* Snap zone ghost */}
        {snapHint && (
          <div
            className="pointer-events-none absolute rounded-lg border-2 border-dashed border-foreground/40 bg-foreground/5 z-[99998]"
            style={{
              left: `${snapHint.x}px`,
              top: `${snapHint.y}px`,
              width: `${snapHint.w}px`,
              height: `${snapHint.h}px`,
              transition: 'all 0.12s ease',
            }}
          />
        )}
      </div>
      {/* ── BOTTOM DESKTOP TASKBAR ── */}
      <footer className="fixed bottom-0 left-0 right-0 h-10 border-t border-border bg-card flex items-center justify-between px-4 z-[9999] text-xs font-mono select-none">
        
        {/* Quick Launch Info / System Menu */}
        <div className="flex items-center gap-3">
          {/* Start / System Button */}
          <div className="relative">
            <button
              onClick={() => setIsSystemMenuOpen(!isSystemMenuOpen)}
              className={`px-2.5 py-1 border rounded flex items-center gap-1 cursor-pointer transition-colors text-[10px] uppercase font-bold tracking-wider ${
                isSystemMenuOpen ? 'bg-foreground text-background border-foreground' : 'bg-background text-foreground border-border hover:border-muted-foreground/40'
              }`}
            >
              <span>System</span>
            </button>

            {isSystemMenuOpen && (
              <>
                {/* Backdrop to close click outside */}
                <div className="fixed inset-0 z-[10000] bg-transparent" onClick={() => setIsSystemMenuOpen(false)} />
                {/* System Menu List Dropdown */}
                <div className="absolute left-0 bottom-9 w-44 bg-neutral-950 border border-border rounded-lg shadow-2xl p-1 font-mono text-[10px] z-[10002] text-white space-y-0.5">
                  <div className="px-2.5 py-1 text-[9px] uppercase tracking-wider text-neutral-500 font-semibold border-b border-border pb-1 mb-1">
                    System Menu
                  </div>
                  <button
                    onClick={() => { setIsSystemMenuOpen(false); openWindow('about'); }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-white hover:text-black cursor-pointer rounded transition-colors text-white"
                  >
                    About Developer
                  </button>
                  <button
                    onClick={() => { setIsSystemMenuOpen(false); openWindow('shell'); }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-white hover:text-black cursor-pointer rounded transition-colors text-white"
                  >
                    Terminal Console
                  </button>
                  <button
                    onClick={() => {
                      setIsSystemMenuOpen(false);
                      setIconPositions(computeIconLayout(window.innerHeight));
                      toast.success("Desktop icons reset to default.");
                    }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-white hover:text-black cursor-pointer rounded transition-colors text-white"
                  >
                    Reset Icons
                  </button>
                  <hr className="border-border my-1" />
                  <button
                    onClick={() => { setIsSystemMenuOpen(false); setIsSleeping(true); }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-white hover:text-black cursor-pointer rounded transition-colors flex items-center justify-between text-white"
                  >
                    <span>Sleep Mode</span>
                    <span className="text-[8px] text-neutral-500 font-bold uppercase">ZzZ</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsSystemMenuOpen(false);
                      toast.success("Rebooting environment...");
                      setTimeout(() => window.location.reload(), 1000);
                    }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-white hover:text-black cursor-pointer rounded transition-colors text-white"
                  >
                    Restart OS
                  </button>
                  <button
                    onClick={() => { setIsSystemMenuOpen(false); setIsShutdown(true); }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-red-500 hover:text-white cursor-pointer rounded transition-colors text-red-400"
                  >
                    Shut Down
                  </button>
                </div>
              </>
            )}
          </div>

          <span className="h-3 w-px bg-border hidden sm:inline" />
          <span className="text-[10px] text-muted-foreground hidden sm:inline">Active Session</span>
          {/* hidden easter-egg pixel */}
          <button
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => window.dispatchEvent(new CustomEvent('zhuday:bsod'))}
            className="h-[6px] w-[6px] rounded-full bg-border/40 hover:bg-red-500/70 transition-colors"
            title=" "
          />
        </div>

        {/* Taskbar Buttons (One for each app window) */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-[55%] scrollbar-none py-1">
          {(Object.keys(windows) as WindowKey[]).map((key) => {
            const w = windows[key];
            const isOpen = w.open;
            const isMin = !!w.minimized;
            const isActive = activeWindow === key && isOpen && !isMin;

            let displayName = '';
            if (key === 'about') displayName = 'about_me.txt';
            if (key === 'projects') displayName = 'projects.dir';
            if (key === 'skills') displayName = 'skills.stack';
            if (key === 'experience') displayName = 'experience.dir';
            if (key === 'contact') displayName = 'contact.card';
            if (key === 'shell') displayName = 'terminal.sh';
            if (key === 'artlab') displayName = 'art_lab.app';
            if (key === 'youtube') displayName = 'retro_tv.app';
            if (key === 'snake') displayName = 'snake.game';
            if (key === 'game2048') displayName = '2048.game';
            if (key === 'guestbook') displayName = 'guestbook.txt';
            if (key === 'quiz') displayName = 'stack.quiz';

            return (
              <button
                key={key}
                onClick={() => {
                  if (!isOpen || isMin) {
                    openWindow(key); // opens, or restores + focuses a minimized window
                  } else if (isActive) {
                    minimizeWindow(key);
                  } else {
                    focusWindow(key);
                  }
                }}
                className={`px-3 py-1 border rounded transition-colors text-[10px] flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-foreground text-background border-foreground font-semibold'
                    : isMin
                    ? 'bg-neutral-900/5 text-muted-foreground border-dashed border-foreground/30 italic'
                    : isOpen
                    ? 'bg-card text-foreground border-foreground/30 font-medium'
                    : 'bg-neutral-900/5 text-muted-foreground border-border hover:border-muted-foreground/30 hover:text-foreground'
                }`}
              >
                {/* Active Indicator dot */}
                {isOpen && <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-background' : isMin ? 'bg-muted-foreground' : 'bg-foreground'}`} />}
                <span>{displayName}</span>
              </button>
            );
          })}
        </div>

        {/* RIGHT SIDE: Telemetry & Audio & Clock */}
        <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground select-none">


          {/* Wi-Fi network indicator (A) */}
          <div className="flex items-center gap-1 border-r border-border pr-3" title={isOnline ? 'Online' : 'Offline'}>
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-foreground" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-red-500" />
            )}
          </div>

          {/* Battery meter indicator (A) */}
          {hasBattery && (
            <div className="hidden sm:flex items-center gap-1.5 border-r border-border pr-3">
              {isCharging ? (
                <BatteryCharging className="w-3.5 h-3.5 text-foreground" />
              ) : (
                <Battery className="w-3.5 h-3.5 text-foreground" />
              )}
              <span>{Math.round(batteryLevel * 100)}%</span>
            </div>
          )}

          {/* Volume Control Mute/Unmute (C) */}
          <button
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              if (!nextMuted) {
                // Play quick click confirmation sound
                setTimeout(() => playSound('click'), 50);
              }
            }}
            className="p-1 hover:bg-neutral-900/10 rounded cursor-pointer transition-colors border border-transparent hover:border-border flex items-center justify-center"
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-foreground" />
            )}
          </button>

          <span className="h-3 w-px bg-border" />

          {/* Clock */}
          <div className="text-[10px] text-foreground font-bold font-mono">
            {timeStr}
          </div>
        </div>
      </footer>

      {/* ── SLEEP MODE FULLSCREEN OVERLAY ── */}
      {isSleeping && (
        <div 
          onClick={() => {
            setIsSleeping(false);
            playSound('open');
            toast.success("System woke up.");
          }}
          className="fixed inset-0 bg-black/95 z-[999999] flex flex-col items-center justify-center cursor-pointer select-none font-mono"
        >
          <div className="text-center space-y-3 animate-pulse">
            <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">System in Sleep Mode</div>
            <div className="text-[9px] text-neutral-600">Click anywhere or press any key to wake up</div>
          </div>
        </div>
      )}

      {/* ── SHUTDOWN MODE FULLSCREEN SCREEN ── */}
      {isShutdown && (
        <div 
          className="fixed inset-0 bg-black z-[999999] flex flex-col items-center justify-center select-none font-mono"
        >
          <div className="text-center space-y-4">
            <button
              onClick={() => {
                toast.loading("Powering on system...");
                setTimeout(() => {
                  setIsShutdown(false);
                  playSound('open');
                  toast.dismiss();
                  toast.success("System booted successfully.");
                }, 1200);
              }}
              className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-900 hover:border-white transition-all cursor-pointer shadow-lg active:scale-95 mx-auto"
              title="Power On"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
              <p className="text-[9px] text-neutral-600 uppercase tracking-widest font-bold">System Powered Off. Click Power to Boot.</p>
          </div>
        </div>
      )}

      {/* ── CLASSIC MAC OS SYSTEM BOOT DIALOG ── */}
      {showBootModal && (
        <div className="fixed inset-0 z-[9999999] bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-80 border-2 border-foreground bg-background p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono text-xs select-none">
            {/* Title / Stripe design */}
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-foreground">
              <span className="w-2 h-2 rounded-full bg-foreground" />
              <span className="font-bold uppercase tracking-widest text-[9px] text-foreground">Welcome Message</span>
            </div>

            <div className="flex gap-4 items-start py-2">
              {/* Retro Alert Icon */}
              <div className="w-10 h-10 border border-foreground flex items-center justify-center rounded bg-card shrink-0">
                <User className="w-5 h-5 text-foreground animate-pulse" />
              </div>
              <div className="space-y-1.5 text-foreground font-sans">
                <h4 className="font-bold text-xs font-mono">Welcome to my space!</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Press any key or click anywhere to enter portfolio.
                </p>
              </div>
            </div>


          </div>
        </div>
      )}
    </div>
  );
}
// Drag event controls updated
// System menu options refactored
// Featured projects section split
// Desktop folder grid sizes modified
// Responsive handheld mode active
// Mobile widgets rendered below app grid
// Availability indicators added

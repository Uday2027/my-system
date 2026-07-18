'use client';

import { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X, Minimize2, Maximize2, PanelBottom } from 'lucide-react';

interface Project {
  title: string;
  description: string;
  tags: string;
  githubUrl: string | null;
  liveUrl: string | null;
}

interface Skill {
  name: string;
  category: string;
  level: number;
}

interface Achievement {
  title: string;
  date: string;
  description: string | null;
}

interface FloatingTerminalProps {
  projects: Project[];
  skills: Skill[];
  achievements: Achievement[];
  inlineEmbed?: boolean;
}

interface LogLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'system';
}

interface GameState {
  active: boolean;
  target: number;
  attempts: number;
}

export default function FloatingTerminal({
  projects,
  skills,
  achievements,
  inlineEmbed = false,
}: FloatingTerminalProps) {
  const [isOpen, setIsOpen] = useState(inlineEmbed);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHalfScreen, setIsHalfScreen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<LogLine[]>([
    { text: '==================================================', type: 'system' },
    { text: '   ZUBAYER HOSSAIN UDAY - INTERACTIVE PORTFOLIO', type: 'system' },
    { text: '==================================================', type: 'system' },
    { text: 'BIO:', type: 'system' },
    { text: '  Full Stack Software Engineer building clean, performant', type: 'system' },
    { text: '  web applications with Next.js, TypeScript, and Prisma.', type: 'system' },
    { text: '  Based in Dhaka, Bangladesh.', type: 'system' },
    { text: '', type: 'system' },
    { text: 'INSTRUCTIONS:', type: 'system' },
    { text: '  - Type commands directly into this shell prompt.', type: 'system' },
    { text: '  - Type "help" to list all available shell commands.', type: 'system' },
    { text: '  - Double-click the icons on the desktop grid to open windows.', type: 'system' },
    { text: '  - Press ⌘K or click "Search" at the top to search or toggle layouts.', type: 'system' },
    { text: '==================================================', type: 'system' },
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Easter Egg States
  const [showMatrix, setShowMatrix] = useState(false);
  const [gameState, setGameState] = useState<GameState>({ active: false, target: 0, attempts: 0 });

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auto-open if inlineEmbed changes
  useEffect(() => {
    if (inlineEmbed) {
      setIsOpen(true);
    }
  }, [inlineEmbed]);

  // Auto scroll to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isOpen, isMinimized, isHalfScreen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && !showMatrix && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized, isHalfScreen, showMatrix]);

  // Grayscale binary rain matrix effect
  useEffect(() => {
    if (!showMatrix || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 500;
      canvas.height = canvas.parentElement?.clientHeight || 350;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const chars = '01';
    const fontSize = 12;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    const draw = () => {
      // Draw transparent background to create trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text parameters (pure white/gray codes for B&W theme)
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        
        // Randomize shades of white/gray
        const opacity = Math.random() * 0.7 + 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [showMatrix]);

  const handleCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    // Log input
    setHistory((prev) => [...prev, { text: `uday@portfolio:~$ ${cmdStr}`, type: 'input' }]);
    setCommandHistory((prev) => [...prev, cmdStr]);
    setHistoryIndex(-1);

    // If gaming, hijack normal command parser
    if (gameState.active) {
      handleGameInput(trimmed);
      return;
    }

    const parts = trimmed.toLowerCase().split(' ');
    const command = parts[0];

    switch (command) {
      case 'help':
        setHistory((prev) => [
          ...prev,
          {
            text: `Available commands:
  about       - Brief introduction about me
  projects    - List my technical projects
  skills      - List my skills & core technologies
  experience  - List my work experience & accomplishments
  contact     - View my email and social links
  neofetch    - Show system parameters & ASCII art
  matrix      - Run interactive binary code rain
  game        - Play a number guessing game
  sudo        - Request superuser permissions
  clear       - Clear terminal screen
  help        - Display this menu`,
            type: 'output',
          },
        ]);
        break;

      case 'neofetch':
        setHistory((prev) => [
          ...prev,
          {
            text: `
 ZZZZZZZZZZZZZZZZZ   HHHHH     HHHHH   UUUUU     UUUUU
 Z::::::::::::::::Z  H::::H   H::::H   U::::U   U::::U
 ZZZZZZZZ::::::Z     H::::H   H::::H   U::::U   U::::U
       Z::::::Z      HH::::::HH::::HH  U::::U   U::::U
      Z::::::Z         H::::::::H      U::::U   U::::U
     Z::::::Z          H::::::::H      U::::U   U::::U
    Z::::::Z           HH::::::HH      U::::U   U::::U
   Z::::::Z              H::::H        U::::U   U::::U
  Z::::::ZZZZZZZZZZ      H::::H        U::::U   U::::U
 Z:::::::::::::::Z       H::::H        U::::UUUU::::U
 ZZZZZZZZZZZZZZZZZ       HHHHHH         UUUUUUUUUUUU
------------------------------------------------------
OS: Zubayer Hossain Uday Shell OS v1.2
Uptime: 2 hours, 14 minutes (Since page load)
Shell: zhu-sh v2.0-stable
Theme: Grayscale / High-Contrast Editorial
Resolution: ${typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Dynamic'}
CPU: Creative Mind Core i9
Memory: 32 GB (Continuous Learning)
Focus: Next.js, React Server Components, TypeScript, SQL`,
            type: 'output',
          },
        ]);
        break;

      case 'sudo':
        setHistory((prev) => [
          ...prev,
          {
            text: `[sudo] password for uday: ********
Access Granted.
Initiating full server diagnostic...
Warning: Mind core running at optimal performance.
Self-destruct sequence initiated... Just kidding! Access authorized.`,
            type: 'output',
          },
        ]);
        break;

      case 'matrix':
        setShowMatrix(true);
        break;

      case 'game':
        const targetNumber = Math.floor(Math.random() * 100) + 1;
        setGameState({ active: true, target: targetNumber, attempts: 0 });
        setHistory((prev) => [
          ...prev,
          {
            text: `Starting number guessing game!
I have chosen a number between 1 and 100.
Type your guess. (Type "exit" to quit the game)`,
            type: 'system',
          },
        ]);
        break;

      case 'about':
        setHistory((prev) => [
          ...prev,
          {
            text: `Zubayer Hossain Uday (ZHU)
Full Stack Software Engineer based in Dhaka, Bangladesh.
Specializing in clean, performant web applications.
Core expertise: React, Next.js, Node.js, TypeScript, SQL/ORM databases.`,
            type: 'output',
          },
        ]);
        break;

      case 'projects':
        if (projects.length === 0) {
          setHistory((prev) => [...prev, { text: 'No projects loaded.', type: 'output' }]);
        } else {
          const list = projects
            .map(
              (p, i) =>
                `[${i + 1}] ${p.title}\n    ${p.description}\n    Tags: ${p.tags}${
                  p.liveUrl ? `\n    Live: ${p.liveUrl}` : ''
                }`
            )
            .join('\n\n');
          setHistory((prev) => [...prev, { text: list, type: 'output' }]);
        }
        break;

      case 'skills':
        if (skills.length === 0) {
          setHistory((prev) => [...prev, { text: 'No skills loaded.', type: 'output' }]);
        } else {
          const grouped = skills.reduce((acc, s) => {
            if (!acc[s.category]) acc[s.category] = [];
            acc[s.category].push(`${s.name} (${s.level}%)`);
            return acc;
          }, {} as Record<string, string[]>);

          const list = Object.entries(grouped)
            .map(([cat, items]) => `${cat}:\n  ${items.join(', ')}`)
            .join('\n\n');
          setHistory((prev) => [...prev, { text: list, type: 'output' }]);
        }
        break;

      case 'experience':
        if (achievements.length === 0) {
          setHistory((prev) => [...prev, { text: 'No experience loaded.', type: 'output' }]);
        } else {
          const list = achievements
            .map((a, i) => `[${a.date}] ${a.title}${a.description ? `\n    ${a.description}` : ''}`)
            .join('\n\n');
          setHistory((prev) => [...prev, { text: list, type: 'output' }]);
        }
        break;

      case 'contact':
        setHistory((prev) => [
          ...prev,
          {
            text: `Contact Info:
  Email:    zubayerhossain1009@gmail.com
  GitHub:   https://github.com/Uday2027
  LinkedIn: https://www.linkedin.com/in/zubayer-hossain-uday-3481841bb/`,
            type: 'output',
          },
        ]);
        break;

      case 'clear':
        setHistory([]);
        break;

      default:
        setHistory((prev) => [
          ...prev,
          { text: `Command not found: "${command}". Type "help" for a list of commands.`, type: 'error' },
        ]);
        break;
    }
  };

  const handleGameInput = (guessStr: string) => {
    if (guessStr.toLowerCase() === 'exit') {
      setGameState({ active: false, target: 0, attempts: 0 });
      setHistory((prev) => [...prev, { text: 'Game exited. Returned to normal shell.', type: 'system' }]);
      return;
    }

    const num = parseInt(guessStr, 10);
    if (isNaN(num)) {
      setHistory((prev) => [...prev, { text: 'Please enter a valid number or type "exit".', type: 'error' }]);
      return;
    }

    const newAttempts = gameState.attempts + 1;
    if (num === gameState.target) {
      setHistory((prev) => [
        ...prev,
        {
          text: `🎉 Correct! You guessed my number ${gameState.target} in ${newAttempts} attempts!`,
          type: 'output',
        },
      ]);
      setGameState({ active: false, target: 0, attempts: 0 });
    } else if (num < gameState.target) {
      setHistory((prev) => [...prev, { text: 'Too low! Guess again.', type: 'output' }]);
      setGameState((prev) => ({ ...prev, attempts: newAttempts }));
    } else {
      setHistory((prev) => [...prev, { text: 'Too high! Guess again.', type: 'output' }]);
      setGameState((prev) => ({ ...prev, attempts: newAttempts }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIndex = historyIndex + 1;
        if (nextIndex < commandHistory.length) {
          setHistoryIndex(nextIndex);
          setInput(commandHistory[commandHistory.length - 1 - nextIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = historyIndex - 1;
      if (nextIndex >= 0) {
        setHistoryIndex(nextIndex);
        setInput(commandHistory[commandHistory.length - 1 - nextIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const toggleTerminal = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
    setShowMatrix(false);
  };

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  const renderTerminalContent = () => {
    return (
      <div className="relative flex-1 flex flex-col h-full bg-neutral-950">
        {/* Header Bar - Hide if embedded inline in a desktop window */}
        {!inlineEmbed && (
          <div className="flex items-center justify-between bg-neutral-900 px-4 h-10 border-b border-white/5 select-none shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-800 border border-white/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-800 border border-white/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-800 border border-white/10" />
              </div>
              <span className="text-[11px] text-neutral-400 font-medium tracking-wide ml-2">zhu@shell:~$</span>
            </div>
            <div className="flex items-center gap-2.5">
              {/* Half Screen Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsHalfScreen(!isHalfScreen);
                }}
                className={`text-neutral-500 hover:text-neutral-300 transition-colors p-1 ${
                  isHalfScreen ? 'text-white' : ''
                }`}
                title={isHalfScreen ? 'Show in Center Modal' : 'Show on Bottom Half Screen'}
              >
                <PanelBottom className="w-3.5 h-3.5" />
              </button>
              {/* Minimize */}
              <button
                onClick={toggleMinimize}
                className="text-neutral-500 hover:text-neutral-300 transition-colors p-1"
                title="Minimize"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-500 hover:text-neutral-300 transition-colors p-1"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Matrix Canvas Mode */}
        {showMatrix ? (
          <div className="relative flex-1 bg-black">
            <canvas ref={canvasRef} className="block w-full h-full" />
            <button
              onClick={() => setShowMatrix(false)}
              className="absolute top-4 right-4 bg-white text-black text-[10px] px-3 py-1.5 uppercase font-medium hover:bg-neutral-200 shadow-lg"
            >
              Exit Matrix
            </button>
          </div>
        ) : (
          <>
            {/* Body Log */}
            <div
              className="flex-1 p-4 overflow-y-auto space-y-2.5 text-neutral-300 selection:bg-neutral-800"
              onClick={() => inputRef.current?.focus()}
            >
              {history.map((line, idx) => (
                <div
                  key={idx}
                  className={`whitespace-pre-wrap leading-relaxed ${
                    line.type === 'input'
                      ? 'text-white font-medium'
                      : line.type === 'error'
                      ? 'text-neutral-500'
                      : line.type === 'system'
                      ? 'text-neutral-400 font-medium'
                      : 'text-neutral-300'
                  }`}
                >
                  {line.text}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            {/* Input Prompt */}
            <div className="flex items-center bg-neutral-900/40 border-t border-white/5 px-4 py-2.5 shrink-0">
              <span className="text-white shrink-0 mr-1.5">
                {gameState.active ? 'guess-the-number:~$ ' : 'uday@portfolio:~$ '}
              </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type 'help' here..."
                className="flex-1 bg-transparent text-white border-0 outline-none p-0 focus:ring-0 placeholder:text-neutral-600"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>
          </>
        )}
      </div>
    );
  };

  if (inlineEmbed) {
    return (
      <div className="flex-1 flex flex-col bg-black text-white h-full overflow-hidden min-h-[220px]">
        {renderTerminalContent()}
      </div>
    );
  }

  return (
    <>
      {/* Floating Center-Bottom Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 inset-x-0 flex justify-center z-50 font-mono text-xs pointer-events-none">
          <button
            onClick={toggleTerminal}
            className="pointer-events-auto flex items-center gap-2 bg-neutral-900 border border-white/10 hover:border-white/30 text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <TerminalIcon className="w-4 h-4" />
            <span>Interactive Shell</span>
          </button>
        </div>
      )}

      {/* Minimized bottom-center bar OR Centered Modal OR Half Screen Drawer */}
      {isOpen && (
        isMinimized ? (
          <div className="fixed bottom-6 inset-x-0 flex justify-center z-50 font-mono text-xs pointer-events-none">
            <div className="pointer-events-auto flex flex-col border border-white/10 bg-neutral-950 shadow-2xl rounded-xl overflow-hidden w-64 h-10">
              {/* Header Bar */}
              <div
                onClick={() => setIsMinimized(false)}
                className="flex items-center justify-between bg-neutral-900 px-4 h-10 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-800 border border-white/10" />
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-800 border border-white/10" />
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-800 border border-white/10" />
                  </div>
                  <span className="text-[11px] text-neutral-400 font-medium tracking-wide ml-2">zhu@shell:~$</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={toggleMinimize}
                    className="text-neutral-500 hover:text-neutral-300 transition-colors p-1"
                    title="Expand"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                    className="text-neutral-500 hover:text-neutral-300 transition-colors p-1"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : isHalfScreen ? (
          /* Half Screen Drawer at the bottom */
          <div className="fixed bottom-0 left-0 right-0 h-[50vh] w-full border-t border-white/10 bg-neutral-950 flex flex-col z-50 font-mono text-xs overflow-hidden shadow-[0_-10px_30px_rgba(0,0,0,0.5)] pointer-events-auto">
            {renderTerminalContent()}
          </div>
        ) : (
          /* Maximized Central Modal */
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs z-50 font-mono text-xs p-4 pointer-events-auto"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="flex flex-col border border-white/10 bg-neutral-950 shadow-2xl rounded-xl overflow-hidden w-[90vw] sm:w-[500px] h-[360px]"
              onClick={(e) => e.stopPropagation()}
            >
              {renderTerminalContent()}
            </div>
          </div>
        )
      )}
    </>
  );
}

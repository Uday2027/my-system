'use client';

import { useEffect, useRef, useState } from 'react';
import { Radio, Pause } from 'lucide-react';
import { useSettings, setSetting } from '@/lib/os/settings';

const TRACK = '/audio/lofi.mp3';

/**
 * Small lo-fi radio widget, fixed bottom-right above the taskbar.
 * Off by default; remembers the on/off preference but never autoplays without
 * a user gesture (browser policy). Silently hides itself if the file 404s.
 */
export default function RadioPlayer() {
  const { radio } = useSettings();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0.35;
    const onErr = () => setAvailable(false);
    a.addEventListener('error', onErr);
    return () => a.removeEventListener('error', onErr);
  }, []);

  // If the stored preference is "on", start on the first user gesture anywhere.
  useEffect(() => {
    if (!radio || playing) return;
    const start = () => {
      audioRef.current
        ?.play()
        .then(() => setPlaying(true))
        .catch(() => {});
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
    window.addEventListener('pointerdown', start);
    window.addEventListener('keydown', start);
    return () => {
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
  }, [radio, playing]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
      setSetting('radio', false);
    } else {
      a.play()
        .then(() => {
          setPlaying(true);
          setSetting('radio', true);
        })
        .catch(() => {});
    }
  };

  if (!available) return null;

  return (
    <div className="fixed bottom-12 right-3 z-[99997] flex items-center gap-2 rounded-md border border-border bg-card/90 px-2 py-1 font-mono text-[10px] text-muted-foreground shadow-lg backdrop-blur-sm">
      <audio ref={audioRef} src={TRACK} loop preload="none" />
      <button
        onClick={toggle}
        className="flex items-center gap-1.5 rounded px-1 py-0.5 text-foreground transition-colors hover:bg-foreground/10"
        title={playing ? 'Pause lo-fi radio' : 'Play lo-fi radio'}
      >
        {playing ? <Pause className="h-3 w-3" /> : <Radio className="h-3 w-3" />}
        <span className="uppercase tracking-wider">{playing ? 'lo-fi · on' : 'lo-fi radio'}</span>
      </button>
      {playing && (
        <span className="flex items-end gap-[2px]" aria-hidden="true">
          <span className="w-[2px] animate-pulse bg-foreground" style={{ height: 6, animationDelay: '0ms' }} />
          <span className="w-[2px] animate-pulse bg-foreground" style={{ height: 10, animationDelay: '150ms' }} />
          <span className="w-[2px] animate-pulse bg-foreground" style={{ height: 4, animationDelay: '300ms' }} />
        </span>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { Radio, Pause, SkipForward } from 'lucide-react';
import { useSettings, setSetting } from '@/lib/os/settings';

// Playlist — drop more files in public/audio/ and add them here.
const TRACKS = [
  { src: '/audio/song.mp3', name: 'track 1' },
  { src: '/audio/lofi.mp3', name: 'lo-fi' },
];

/**
 * Small radio widget, fixed bottom-right above the taskbar. Cycles through the
 * playlist (advances on track end, wraps around; Skip jumps to the next).
 * Off by default; remembers the on/off preference but never autoplays without a
 * user gesture (browser policy). Hides itself if the first file 404s.
 */
export default function RadioPlayer() {
  const { radio } = useSettings();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0.35;
    const onErr = () => {
      if (idx === 0) setAvailable(false);
    };
    const onEnded = () => setIdx((i) => (i + 1) % TRACKS.length);
    a.addEventListener('error', onErr);
    a.addEventListener('ended', onEnded);
    return () => {
      a.removeEventListener('error', onErr);
      a.removeEventListener('ended', onEnded);
    };
  }, [idx]);

  // When the track index changes while playing, load + play the new one.
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !playing) return;
    a.load();
    a.play().catch(() => {});
  }, [idx, playing]);

  // Stored preference "on" -> start on the first user gesture anywhere.
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

  const skip = () => setIdx((i) => (i + 1) % TRACKS.length);

  if (!available) return null;

  const track = TRACKS[idx];

  return (
    <div className="fixed bottom-12 right-3 z-[99997] flex items-center gap-2 rounded-md border border-border bg-card/90 px-2 py-1 font-mono text-[10px] text-muted-foreground shadow-lg backdrop-blur-sm">
      <audio ref={audioRef} src={track.src} preload="none" />
      <button
        onClick={toggle}
        className="flex items-center gap-1.5 rounded px-1 py-0.5 text-foreground transition-colors hover:bg-foreground/10"
        title={playing ? 'Pause radio' : 'Play radio'}
      >
        {playing ? <Pause className="h-3 w-3" /> : <Radio className="h-3 w-3" />}
        <span className="uppercase tracking-wider">{playing ? `radio · ${track.name}` : 'radio'}</span>
      </button>
      {playing && (
        <>
          <span className="flex items-end gap-[2px]" aria-hidden="true">
            <span className="w-[2px] animate-pulse bg-foreground" style={{ height: 6, animationDelay: '0ms' }} />
            <span className="w-[2px] animate-pulse bg-foreground" style={{ height: 10, animationDelay: '150ms' }} />
            <span className="w-[2px] animate-pulse bg-foreground" style={{ height: 4, animationDelay: '300ms' }} />
          </span>
          {TRACKS.length > 1 && (
            <button onClick={skip} title="Next track" className="rounded px-0.5 text-foreground hover:bg-foreground/10">
              <SkipForward className="h-3 w-3" />
            </button>
          )}
        </>
      )}
    </div>
  );
}

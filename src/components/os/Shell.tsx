'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import CrtOverlay from './CrtOverlay';
import BootSequence from './BootSequence';
import MobileBoot from './MobileBoot';
import RadioPlayer from './RadioPlayer';
import Screensaver from './Screensaver';
import Bsod from './Bsod';
import Helper from './Helper';
import { hydrateSettings, setSetting } from '@/lib/os/settings';
import { useIsMobile } from '@/lib/os/useIsMobile';

const BOOT_KEY = 'zhuday.booted.v1';

interface ShellProps {
  counts: { projects: number; skills: number; achievements: number };
  children: ReactNode;
}

/**
 * Client wrapper around the whole desktop:
 *  - hydrates the settings store from localStorage
 *  - renders the CRT overlay
 *  - plays the boot sequence once per tab session (skipped for reduced-motion)
 *
 * `children` (the desktop) is always in the DOM so it stays server-rendered for
 * SEO; the boot overlay simply covers it until dismissed.
 */
export default function Shell({ counts, children }: ShellProps) {
  const [booting, setBooting] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    hydrateSettings();

    let alreadyBooted = false;
    try {
      alreadyBooted = sessionStorage.getItem(BOOT_KEY) === '1';
    } catch {
      /* ignore */
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!alreadyBooted && !reduced) setBooting(true);
    else markBooted();
  }, []);

  function markBooted() {
    try {
      sessionStorage.setItem(BOOT_KEY, '1');
    } catch {
      /* ignore */
    }
  }

  function enterFullscreen() {
    const el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen) {
      el.requestFullscreen().catch(() => {
        /* denied / unsupported — ignore */
      });
    }
  }

  const finishBoot = () => {
    markBooted();
    setBooting(false);
  };

  // Konami code: ↑↑↓↓←→←→ B A  ->  CRT full + a wink
  useEffect(() => {
    const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let i = 0;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      i = k === seq[i] ? i + 1 : k === seq[0] ? 1 : 0;
      if (i === seq.length) {
        i = 0;
        setSetting('crt', 'full');
        document.documentElement.classList.add('konami');
        toast.success('🎮 CHEAT MODE — CRT maxed', { duration: 2500 });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Sessions that skip the boot screen (returning visit / reduced-motion) still
  // get fullscreen on their first interaction with the page.
  useEffect(() => {
    if (booting) return;
    const once = () => {
      enterFullscreen();
      window.removeEventListener('pointerdown', once);
      window.removeEventListener('keydown', once);
    };
    window.addEventListener('pointerdown', once);
    window.addEventListener('keydown', once);
    return () => {
      window.removeEventListener('pointerdown', once);
      window.removeEventListener('keydown', once);
    };
  }, [booting]);

  return (
    <>
      <CrtOverlay />
      {children}
      {!booting && !isMobile && <RadioPlayer />}
      {!booting && <Screensaver />}
      {!booting && !isMobile && <Helper />}
      <Bsod />
      {booting &&
        (isMobile ? (
          <MobileBoot counts={counts} onEnter={enterFullscreen} onDone={finishBoot} />
        ) : (
          <BootSequence counts={counts} onEnter={enterFullscreen} onDone={finishBoot} />
        ))}
    </>
  );
}

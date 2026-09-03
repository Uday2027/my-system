'use client';

import { useEffect, useState, type ReactNode } from 'react';
import CrtOverlay from './CrtOverlay';
import BootSequence from './BootSequence';
import { hydrateSettings } from '@/lib/os/settings';

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

  const finishBoot = () => {
    markBooted();
    setBooting(false);
  };

  return (
    <>
      <CrtOverlay />
      {children}
      {booting && <BootSequence counts={counts} onDone={finishBoot} />}
    </>
  );
}

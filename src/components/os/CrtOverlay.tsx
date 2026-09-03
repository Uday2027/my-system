'use client';

import { useEffect, useState } from 'react';
import { useSettings, type Crt } from '@/lib/os/settings';
import { useIsMobile } from '@/lib/os/useIsMobile';

/**
 * Full-screen CRT treatment, driven by the `crt` setting ('off' | 'subtle' | 'full').
 * Pure CSS (see globals.css). Sets `crt-*` on <html> so global rules (scanlines,
 * chromatic aberration) can apply; renders the overlay layers itself.
 *
 * Guards: prefers-reduced-motion forces 'off'; small screens / low memory cap at 'subtle'.
 */
export default function CrtOverlay() {
  const { crt } = useSettings();
  const isMobile = useIsMobile();
  const [reduced, setReduced] = useState(false);
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);

    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    setLowPower((typeof deviceMemory === 'number' && deviceMemory < 4) || window.innerWidth < 768);

    return () => mq.removeEventListener('change', sync);
  }, []);

  let level: Crt = crt;
  if (reduced) level = 'off';
  else if (lowPower && level === 'full') level = 'subtle';

  useEffect(() => {
    const cl = document.documentElement.classList;
    cl.remove('crt-off', 'crt-subtle', 'crt-full');
    cl.add(`crt-${level}`);
    return () => {
      cl.remove('crt-off', 'crt-subtle', 'crt-full');
    };
  }, [level]);

  if (level === 'off') return null;

  // Mobile: scanlines + vignette only — no flicker / glare / roll.
  if (isMobile) {
    return (
      <div className="crt-root" aria-hidden="true">
        <div className="crt-scanlines" />
        <div className="crt-vignette" />
      </div>
    );
  }

  return (
    <div className="crt-root" aria-hidden="true">
      <div className="crt-scanlines" />
      <div className="crt-vignette" />
      <div className="crt-flicker" />
      {level === 'full' && (
        <>
          <div className="crt-glare" />
          <div className="crt-roll" />
        </>
      )}
    </div>
  );
}

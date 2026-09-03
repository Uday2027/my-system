'use client';

import { useEffect, useState } from 'react';

const QUERY = '(max-width: 767px)';

/**
 * `true` when the viewport is phone-sized. SSR-safe: returns `false` on the
 * server and the first client render, then updates after mount.
 */
export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return mobile;
}

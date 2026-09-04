'use client';

/**
 * Tiny localStorage-backed settings store with a useSyncExternalStore hook.
 * No React context — CrtOverlay, the top-bar menu, and the audio widgets all
 * read/write the same module-level state.
 */
import { useSyncExternalStore } from 'react';

export type Tone = 'ink' | 'paper' | 'sepia' | 'amber' | 'green' | 'c64';
export type Typography = 'sans' | 'serif' | 'mono';
export type Density = 'standard' | 'compact';
export type Crt = 'off' | 'subtle' | 'full';

export interface Settings {
  tone: Tone;
  typography: Typography;
  density: Density;
  crt: Crt;
  sound: boolean;
  radio: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  tone: 'ink',
  typography: 'sans',
  density: 'standard',
  crt: 'off',
  sound: false,
  radio: false,
};

const KEY = 'zhuday.settings.v1';

let state: Settings = DEFAULT_SETTINGS;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode / disabled storage — ignore */
  }
}

/** Load stored values once, on the client, after mount. Call from a top-level effect. */
export function hydrateSettings() {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      state = { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
      emit();
    }
  } catch {
    /* corrupt value — keep defaults */
  }
}

export function getSettings(): Settings {
  return state;
}

export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
  if (state[key] === value) return;
  state = { ...state, [key]: value };
  persist();
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useSettings(): Settings {
  // Server snapshot is always DEFAULT_SETTINGS, so the first client render
  // matches SSR; hydrateSettings() then emits the stored values.
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => DEFAULT_SETTINGS,
  );
}

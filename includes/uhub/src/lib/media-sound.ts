import { useSyncExternalStore } from 'react';

interface MutePreference {
  muted: boolean;
  listeners: Set<() => void>;
  key?: string;
}

const siteSound: MutePreference = { muted: true, listeners: new Set() };
const memeSounds = new Map<string, MutePreference>();

function usePreference(preference: MutePreference) {
  const muted = useSyncExternalStore(
    listener => {
      preference.listeners.add(listener);
      return () => { preference.listeners.delete(listener); };
    },
    () => preference.muted,
  );
  const setMuted = (value: boolean) => {
    if (preference.muted === value) return;
    preference.muted = value;
    if (preference.key) {
      try {
        localStorage.setItem(preference.key, String(value));
      } catch (error) {
        console.error('[MEMEBOX SOUND] Unable to save sound preference:', error);
      }
    }
    preference.listeners.forEach(listener => listener());
  };
  return { muted, setMuted };
}

export function useSiteWideMute() {
  const { muted, setMuted } = usePreference(siteSound);
  const toggle = () => {
    const next = !siteSound.muted;
    setMuted(next);
    document.querySelectorAll<HTMLMediaElement>('[data-union-radio-player]').forEach(player => {
      player.muted = next;
      if (!next && player.autoplay) {
        void player.play().catch(error => console.warn('[UNION RADIO] Playback could not start:', error));
      }
    });
  };
  return { muted, toggle };
}

export function useMemeMute(userId: number | string | undefined) {
  const key = `uhub:memebox-muted:${userId ?? 'visitor'}`;
  let preference = memeSounds.get(key);
  if (!preference) {
    let muted = true;
    try {
      muted = localStorage.getItem(key) !== 'false';
    } catch (error) {
      console.error('[MEMEBOX SOUND] Unable to read sound preference:', error);
    }
    preference = { muted, key, listeners: new Set() };
    memeSounds.set(key, preference);
  }
  const { muted, setMuted } = usePreference(preference);
  const owner = String(userId ?? 'visitor');
  return {
    muted,
    owner,
    setMuted: (value: boolean) => {
      setMuted(value);
      document.querySelectorAll<HTMLMediaElement>('[data-meme-sound-owner]').forEach(player => {
        if (player.dataset.memeSoundOwner !== owner) return;
        player.muted = value;
        if (!value && player.autoplay) {
          void player.play().catch(error => console.warn('[MEMEBOX SOUND] Playback could not start:', error));
        }
      });
    },
  };
}

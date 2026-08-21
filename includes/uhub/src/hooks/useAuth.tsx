
// Singleton auth store shared across every independent React root the uHub bundle
// mounts (all roots live in the same JS module scope, so this plain object acts as
// a cross-root context without needing a <Provider> wrapper).
import { useSyncExternalStore, type ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  profile_image_url?: string;
  is_high_high_high_admin?: number;
  is_high_high_admin?: number;
  is_high_admin?: number;
  is_new_user?: number;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
}

let state: AuthState = { user: null, isLoading: true };
const listeners = new Set<() => void>();

function setState(next: Partial<AuthState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

let hasFetchedMe = false;
function ensureMeFetched() {
  if (hasFetchedMe) return;
  hasFetchedMe = true;
  fetch('/api/auth/me', { credentials: 'include' })
    .then((response) => (response.ok ? response.json() : null))
    .then((userData) => setState({ user: userData, isLoading: false }))
    .catch((error) => {
      console.error('Failed to fetch user', error);
      setState({ isLoading: false });
    });
}

const login = (userData: User) => setState({ user: userData });

const logout = async () => {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  } catch (error) {
    console.error('Logout failed', error);
  } finally {
    setState({ user: null });
  }
};

export const useAuth = () => {
  ensureMeFetched();
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);
  return { user: snapshot.user, isLoading: snapshot.isLoading, login, logout };
};

// Kept as a no-op passthrough so any existing `<AuthProvider>` wrappers keep working
// without React Context, since state now lives in the module-level store above.
export const AuthProvider = ({ children }: { children: ReactNode }) => children;

import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const STORAGE_KEY = 'proxy_planning_auth';

type AuthState = {
  isAuthenticated: boolean;
  user: string | null;
  company?: string | null;
  memberName?: string | null;
};

const initialState: AuthState = {
  isAuthenticated: false,
  user: null
};

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,
    initialize() {
      if (!browser) {
        return;
      }

      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }

      try {
        const parsed = JSON.parse(raw) as AuthState;
        set({
          isAuthenticated: Boolean(parsed.isAuthenticated),
          user: parsed.user ?? null,
          company: parsed.company ?? null,
          memberName: parsed.memberName ?? null
        });
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    },
    login(user: string, company: string | null = null, memberName: string | null = null) {
      const nextState: AuthState = {
        isAuthenticated: true,
        user,
        company,
        memberName
      };

      set(nextState);

      if (browser) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      }
    },
    logout() {
      set(initialState);

      if (browser) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    },
    setGuest() {
      update((state) => ({
        ...state,
        user: state.user ?? 'Guest'
      }));
    }
  };
}

export const auth = createAuthStore();
import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type UserProfile = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  organizationId: string;
  organizationName: string;
  phone?: string | null;
};

export type AuthState = {
  isAuthenticated: boolean;
  user: string | null;
  email: string | null;
  company: string | null;
  memberName: string | null;
  organizationId: string | null;
  role: string | null;
  profile: UserProfile | null;
};

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  email: null,
  company: null,
  memberName: null,
  organizationId: null,
  role: null,
  profile: null
};

function createAuthStore() {
  const { subscribe, set } = writable<AuthState>(initialState);

  return {
    subscribe,

    async initialize(): Promise<AuthState> {
      if (!browser) return initialState;

      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            const nextState: AuthState = {
              isAuthenticated: true,
              user: data.user.fullName || data.user.email,
              email: data.user.email,
              company: data.user.organizationName,
              memberName: data.user.fullName,
              organizationId: data.user.organizationId,
              role: data.user.role,
              profile: data.user
            };
            set(nextState);
            return nextState;
          }
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
      }

      set(initialState);
      return initialState;
    },

    async login(identity: string, password: string): Promise<{ success: boolean; error?: string }> {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identity, password })
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          return { success: false, error: data.error?.message || 'Login failed.' };
        }

        const user = data.user;
        const nextState: AuthState = {
          isAuthenticated: true,
          user: user.fullName || user.email,
          email: user.email,
          company: user.organizationName,
          memberName: user.fullName,
          organizationId: user.organizationId,
          role: user.role,
          profile: user
        };

        set(nextState);
        return { success: true };
      } catch (err: any) {
        console.error('Login error:', err);
        return { success: false, error: 'Network or server error during login.' };
      }
    },

    async signup(payload: {
      email: string;
      password: string;
      fullName: string;
      company: string;
      phone?: string;
    }): Promise<{ success: boolean; error?: string }> {
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          return { success: false, error: data.error?.message || 'Signup failed.' };
        }

        const user = data.user;
        const nextState: AuthState = {
          isAuthenticated: true,
          user: user.fullName || user.email,
          email: user.email,
          company: user.organizationName,
          memberName: user.fullName,
          organizationId: user.organizationId,
          role: user.role,
          profile: user
        };

        set(nextState);
        return { success: true };
      } catch (err: any) {
        console.error('Signup error:', err);
        return { success: false, error: 'Network or server error during signup.' };
      }
    },

    async logout(): Promise<void> {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        set(initialState);
      }
    }
  };
}

export const auth = createAuthStore();
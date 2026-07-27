// ============================================================
// AgriSmart — Global State (Zustand)
// ============================================================
import { users } from '@/data/seed';
import type { Locale,UserRole } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const PERSIST_KEY = 'agrismart-store';
const LEGACY_PERSIST_KEY = 'kisantrust-store';

if (typeof window !== 'undefined') {
  try {
    const currentState = window.localStorage.getItem(PERSIST_KEY);
    const legacyState = window.localStorage.getItem(LEGACY_PERSIST_KEY);
    if (!currentState && legacyState) {
      window.localStorage.setItem(PERSIST_KEY, legacyState);
    }
  } catch {
    // Storage can be unavailable in private browsing or restricted environments.
  }
}

interface AppState {
  // Auth
  currentUserId: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;

  // Preferences
  locale: Locale;
  lowBandwidth: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;

  // UI
  sidebarOpen: boolean;
  notificationPanelOpen: boolean;

  // Onboarding
  onboardingStep: number;
  onboardingData: Record<string, unknown>;

  // Actions
  login: (userId: string, role: UserRole) => void;
  logout: () => void;
  setLocale: (locale: Locale) => void;
  toggleLowBandwidth: () => void;
  toggleReducedMotion: () => void;
  toggleHighContrast: () => void;
  toggleLargeText: () => void;
  setSidebarOpen: (open: boolean) => void;
  setNotificationPanelOpen: (open: boolean) => void;
  setOnboardingStep: (step: number) => void;
  setOnboardingData: (data: Record<string, unknown>) => void;
  resetOnboarding: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentUserId: null,
      role: null,
      isAuthenticated: false,
      locale: 'en',
      lowBandwidth: false,
      reducedMotion: false,
      highContrast: false,
      largeText: false,
      sidebarOpen: false,
      notificationPanelOpen: false,
      onboardingStep: 0,
      onboardingData: {},

      login: (userId, role) => set({ currentUserId: userId, role, isAuthenticated: true, sidebarOpen: false }),
      logout: () => set({ currentUserId: null, role: null, isAuthenticated: false, sidebarOpen: false, notificationPanelOpen: false }),
      setLocale: (locale) => set({ locale }),
      toggleLowBandwidth: () => set((s) => ({ lowBandwidth: !s.lowBandwidth })),
      toggleReducedMotion: () => set((s) => ({ reducedMotion: !s.reducedMotion })),
      toggleHighContrast: () => set((s) => ({ highContrast: !s.highContrast })),
      toggleLargeText: () => set((s) => ({ largeText: !s.largeText })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setNotificationPanelOpen: (notificationPanelOpen) => set({ notificationPanelOpen }),
      setOnboardingStep: (onboardingStep) => set({ onboardingStep }),
      setOnboardingData: (data) => set((s) => ({ onboardingData: { ...s.onboardingData, ...data } })),
      resetOnboarding: () => set({ onboardingStep: 0, onboardingData: {} }),
    }),
    {
      name: PERSIST_KEY,
      partialize: (state: AppState) => ({
        currentUserId: state.currentUserId,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
        locale: state.locale,
        lowBandwidth: state.lowBandwidth,
        reducedMotion: state.reducedMotion,
        highContrast: state.highContrast,
        largeText: state.largeText,
        onboardingStep: state.onboardingStep,
        onboardingData: state.onboardingData,
      }),
      merge: (persistedState: unknown, currentState: AppState) => {
        const persisted = persistedState as Partial<AppState>;
        const savedUser = users.find((user) => user.id === persisted.currentUserId);
        const validSession = Boolean(
          persisted.isAuthenticated
          && savedUser
          && persisted.role
          && savedUser.role === persisted.role,
        );

        return {
          ...currentState,
          ...persisted,
          currentUserId: validSession ? persisted.currentUserId ?? null : null,
          role: validSession ? persisted.role ?? null : null,
          isAuthenticated: validSession,
          sidebarOpen: false,
          notificationPanelOpen: false,
        };
      },
    }
  )
);

// ── Demo login helper ──────────────────────────────────────
export function demoLogin(role: UserRole): string {
  const user = users.find(u => u.role === role);
  return user?.id || '';
}

// ── Hook to get current user ───────────────────────────────
export function useCurrentUser() {
  const userId = useAppStore(s => s.currentUserId);
  return users.find(u => u.id === userId) || null;
}

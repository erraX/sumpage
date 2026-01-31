import { create } from "zustand";

export type LoadingStep =
  | "idle"
  | "extracting"
  | "connecting"
  | "complete";

interface UIState {
  isLoading: boolean;
  loadingStep: LoadingStep;
  error: string | null;
  showSettings: boolean;
  showNewChatButton: boolean;

  // Actions
  setIsLoading: (loading: boolean) => void;
  setLoadingStep: (step: LoadingStep) => void;
  setError: (error: string | null) => void;
  setShowSettings: (show: boolean) => void;
  setShowNewChatButton: (show: boolean) => void;
  resetUI: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  loadingStep: "idle",
  error: null,
  showSettings: false,
  showNewChatButton: false,

  setIsLoading: (isLoading) => set({ isLoading }),

  setLoadingStep: (loadingStep) => set({ loadingStep }),

  setError: (error) => set({ error }),

  setShowSettings: (showSettings) => set({ showSettings }),

  setShowNewChatButton: (showNewChatButton) => set({ showNewChatButton }),

  resetUI: () =>
    set({
      isLoading: false,
      loadingStep: "idle",
      error: null,
      showSettings: false,
    }),
}));

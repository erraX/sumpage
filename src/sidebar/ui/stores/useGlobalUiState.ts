import { create } from 'zustand';

interface State {
  settingPageVisible: boolean;
}

interface Actions {
  showSettingPage: () => void;
  hideSettingPage: () => void;
  toggleSettingPage: () => void;
}

export const useGlobalUiState = create<State & Actions>((set, get) => ({
  settingPageVisible: false,
  showSettingPage: () => set({ settingPageVisible: true }),
  hideSettingPage: () => set({ settingPageVisible: false }),
  toggleSettingPage: () => set({ settingPageVisible: !get().settingPageVisible }),
}));

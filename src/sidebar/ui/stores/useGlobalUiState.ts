import { create } from 'zustand';

interface State {
  settingPageVisible: boolean;
}

interface Actions {
  showSettingPage: () => void;
  hideSettingPage: () => void;
}

export const useGlobalUiState = create<State & Actions>((set) => ({
  settingPageVisible: false,
  showSettingPage: () => set({ settingPageVisible: true }),
  hideSettingPage: () => set({ settingPageVisible: false }),
}));

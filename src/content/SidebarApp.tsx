import { useEffect, useRef, useState } from 'react';
import { Host } from './components/styles';
import { DEFAULT_PROMPT_TEMPLATE } from './constants';
import {
  usePromptTemplates,
  useProviderConfigs,
  useGlobalSettings,
  useGlobalUiState,
} from '../new/stores';
import { ProviderConfig } from '../new/components/ProviderConfig';

interface SidebarAppProps {
  onClose: () => void;
  initialShowSettings?: boolean;
}

export function SidebarApp({
  onClose,
  initialShowSettings = false,
}: SidebarAppProps) {
  const [isInitingApp, setIsInitingApp] = useState(true);
  const hasInitialized = useRef(false);

  const promptTemplates = usePromptTemplates();
  const providerConfigs = useProviderConfigs();
  const globalSettings = useGlobalSettings();
  const { settingPageVisible, showSettingPage, hideSettingPage } =
    useGlobalUiState();

  // Sync initial settings visibility from the panel options
  useEffect(() => {
    if (initialShowSettings) {
      showSettingPage();
    } else {
      hideSettingPage();
    }
  }, [initialShowSettings, showSettingPage, hideSettingPage]);

  // Initialize on mount (guarded so it only runs once even if dependencies change)
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const init = async () => {
      await globalSettings.initialize();
      await promptTemplates.initialize(DEFAULT_PROMPT_TEMPLATE);

      await providerConfigs.load();

      const configured = await providerConfigs.checkConfiguration();
      if (!configured) {
        console.log('Provider not configured. Prompting user to configure.');
        showSettingPage();
      } else {
        if (
          !globalSettings.settings.providerType &&
          providerConfigs.selectedProvider
        ) {
          const config =
            providerConfigs.configs[providerConfigs.selectedProvider];
          globalSettings.update({ providerType: config.provider });
        }
      }

      setIsInitingApp(false);
    };
    void init();
  }, [globalSettings, promptTemplates, providerConfigs, showSettingPage]);

  // Main content view
  const handleToggleSettings = () => {
    if (settingPageVisible) {
      hideSettingPage();
    } else {
      showSettingPage();
    }
  };

  return (
    <>
      <div className="sumpage-panel-header">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <h2 style={{ margin: 0 }}>Sumpage</h2>
          <button
            className="sumpage-panel-btn"
            title="Settings"
            onClick={handleToggleSettings}
            aria-pressed={settingPageVisible}
          >
            ⚙
          </button>
        </div>
        <button
          className="sumpage-panel-btn sumpage-panel-btn-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          ×
        </button>
      </div>

      <div className="sumpage-panel-content">
        <Host>
          {isInitingApp && <div>loading...</div>}
          {settingPageVisible && (
            <ProviderConfig onComplete={hideSettingPage} />
          )}
          {!settingPageVisible && <div>Hello world</div>}
        </Host>
      </div>
    </>
  );
}

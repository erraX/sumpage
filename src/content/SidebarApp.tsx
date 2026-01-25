import { useEffect, useState } from 'react';
import { Host } from './components/styles';
import { DEFAULT_PROMPT_TEMPLATE } from './constants';
import {
  usePromptTemplates,
  useProviderConfigs,
  useGlobalSettings,
} from '../new/stores';
import { ProviderConfig } from '../new/components/ProviderConfig';

interface SidebarAppProps {
  onClose: () => void;
}

export function SidebarApp({}: SidebarAppProps) {
  const [shouldShowSettings, setShouldShowSettings] = useState(false);
  const [isInitingApp, setIsInitingApp] = useState(true);

  const promptTemplates = usePromptTemplates();
  const providerConfigs = useProviderConfigs();
  const globalSettings = useGlobalSettings();

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      await globalSettings.initialize();
      await promptTemplates.initialize(DEFAULT_PROMPT_TEMPLATE);

      await providerConfigs.load();

      const configured = await providerConfigs.checkConfiguration();
      if (!configured) {
        console.log('Provider not configured. Prompting user to configure.');
        setShouldShowSettings(true);
      } else {
        if (
          !globalSettings.settings.providerId &&
          providerConfigs.selectedProvider
        ) {
          const config =
            providerConfigs.configs[providerConfigs.selectedProvider];
          globalSettings.update({ providerId: config.id });
        }
      }

      setIsInitingApp(false);
    };
    init();
  }, []);

  // Main content view
  return (
    <Host>
      {isInitingApp && <div>...</div>}
      {shouldShowSettings && <ProviderConfig />}
    </Host>
  );
}

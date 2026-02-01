import { useEffect, useState } from 'react';
import { Stack } from '@mui/material';
import { Host, PanelContent } from './components/styles';
import { DEFAULT_PROMPT_TEMPLATE } from './constants';
import {
  usePromptTemplates,
  useProviderConfigs,
  useGlobalSettings,
  useGlobalUiState,
} from './stores';
import { ProviderConfig } from './components/provider/ProviderConfig';
import { SummaryStarter } from './components/SummaryStarter';
import { PanelHeader } from './components/PanelHeader';
import { PromptTemplatesManager } from './components/PromptTemplatesManager';

interface SidebarAppProps {
  onClose: () => void;
}

export function SidebarApp({ onClose }: SidebarAppProps) {
  const [isInitingApp, setIsInitingApp] = useState(true);

  const promptTemplates = usePromptTemplates();
  const providerConfigs = useProviderConfigs();
  const globalSettings = useGlobalSettings();
  const {
    settingPageVisible,
    showSettingPage,
    hideSettingPage,
    toggleSettingPage,
  } = useGlobalUiState();

  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PanelHeader
        onToggleSettings={toggleSettingPage}
        onClose={onClose}
        settingPageVisible={settingPageVisible}
      />
      <PanelContent>
        <Host>
          {isInitingApp && <div>loading...</div>}
          {settingPageVisible && (
            <Stack spacing={2} sx={{ px: 1, pb: 2 }}>
              <ProviderConfig onComplete={hideSettingPage} />
              <PromptTemplatesManager />
            </Stack>
          )}
          {!settingPageVisible && (
            <SummaryStarter onOpenSettings={showSettingPage} />
          )}
        </Host>
      </PanelContent>
    </>
  );
}

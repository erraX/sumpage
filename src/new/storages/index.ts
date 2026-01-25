/**
 * Storage modules - Re-exports for convenient imports
 */
// Re-export primitives from chromeStorage
export {
  getStorageArea,
  isChromeStorageAvailable,
  getValue,
  getValues,
  setValue,
  setValues,
  removeValue,
  removeValues,
  subscribe,
} from './chromeStorage';

// Re-export prompt template storage
export {
  getTemplates,
  saveTemplates,
  getTemplate,
  addTemplate,
  updateTemplate,
  deleteTemplate,
  initialize as initializeTemplates,
} from './promptTemplateStorage';

// Re-export provider config storage
export {
  getConfig,
  saveConfig,
  clearConfig,
  isConfigured,
  getConfigs,
  saveConfigs,
  getConfigById,
  addConfig,
  updateConfig,
  deleteConfig,
  findByApiKey,
  initialize as initializeConfigs,
} from './providerConfigStorage';

// Re-export global settings storage
export {
  getSettings,
  saveSettings,
  updateSettings,
  resetSettings,
  initialize as initializeSettings,
  getSelectedPromptId,
  setSelectedPromptId,
} from './globalSettingsStorage';

// Re-export chat history storage
export {
  getChatHistory,
  saveChatHistory,
  clearChatHistory,
  getAllChatHistory,
  clearAll as clearAllChatHistory,
  initialize as initializeChat,
  getSessions,
  getSession,
  upsertSession,
  deleteSession,
} from './chatHistoryStorage';

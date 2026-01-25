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

// Re-export storage functions (avoid naming conflicts)
export {
  getTemplates,
  saveTemplates,
  getTemplate,
  addTemplate,
  updateTemplate,
  deleteTemplate,
  initialize as initializeTemplates,
} from './promptTemplateStorage';

export {
  getConfigs,
  saveConfigs,
  getConfig,
  addConfig,
  updateConfig,
  deleteConfig,
  initialize as initializeConfigs,
} from './providerConfigStorage';

export {
  getSettings,
  saveSettings,
  updateSettings,
  resetSettings,
  initialize as initializeSettings,
} from './globalSettingsStorage';

export {
  getSessions,
  saveSessions,
  getSessionByUrl,
  upsertSession,
  deleteSession,
  getRecords,
  saveRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  clearAll as clearChatHistory,
  initialize as initializeChat,
} from './chatHistoryStorage';

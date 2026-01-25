import { useState, useCallback } from 'react';
import type { PromptTemplate } from '../../types';
import * as templatesStorage from '../store/templatesStorage';
import { DEFAULT_PROMPT_TEMPLATE } from '../../types';

interface UsePromptTemplatesReturn {
  templates: PromptTemplate[];
  selectedTemplateId: string | null;
  isLoading: boolean;
  error: string | null;
  loadTemplates: () => Promise<void>;
  addTemplate: (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<PromptTemplate>) => Promise<void>;
  removeTemplate: (id: string) => Promise<void>;
  selectTemplate: (id: string | null) => Promise<void>;
}

export function usePromptTemplates(): UsePromptTemplatesReturn {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [loadedTemplates, selectedId] = await Promise.all([
        templatesStorage.getPromptTemplates(),
        templatesStorage.getSelectedPromptId(),
      ]);
      setTemplates(loadedTemplates);
      setSelectedTemplateIdState(selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTemplate = useCallback(
    async (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
      setIsLoading(true);
      setError(null);
      try {
        const newTemplate: PromptTemplate = {
          ...template,
          id: `template-${Date.now()}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        const newTemplates = [...templates, newTemplate];
        await templatesStorage.savePromptTemplates(newTemplates);
        setTemplates(newTemplates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add template');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [templates]
  );

  const updateTemplate = useCallback(
    async (id: string, updates: Partial<PromptTemplate>) => {
      setIsLoading(true);
      setError(null);
      try {
        const newTemplates = templates.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
        );
        await templatesStorage.savePromptTemplates(newTemplates);
        setTemplates(newTemplates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update template');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [templates]
  );

  const removeTemplate = useCallback(
    async (id: string) => {
      // Don't allow removing the default template
      if (id === DEFAULT_PROMPT_TEMPLATE.id) {
        setError('Cannot delete the default template');
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const newTemplates = templates.filter((t) => t.id !== id);
        await templatesStorage.savePromptTemplates(newTemplates);
        setTemplates(newTemplates);

        // Clear selection if removed template was selected
        if (selectedTemplateId === id) {
          await templatesStorage.setSelectedPromptId(null);
          setSelectedTemplateIdState(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove template');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [templates, selectedTemplateId]
  );

  const selectTemplate = useCallback(async (id: string | null) => {
    try {
      await templatesStorage.setSelectedPromptId(id);
      setSelectedTemplateIdState(id);
    } catch (err) {
      console.log('select template error', err);
      setError(err instanceof Error ? err.message : 'Failed to select template');
    }
  }, []);

  return {
    templates,
    selectedTemplateId,
    isLoading,
    error,
    loadTemplates,
    addTemplate,
    updateTemplate,
    removeTemplate,
    selectTemplate,
  };
}

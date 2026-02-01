import { useEffect, useMemo, useState } from 'react';
import { Box, Stack, TextField, Typography } from '@mui/material';
import type { PromptTemplate } from '../models';
import { usePromptTemplates } from '../stores';
import { DEFAULT_PROMPT_TEMPLATE } from '../constants';
import { Card, CardContent, CardHeader, CardTitle, Alert, AlertDescription } from './ui';
import { Button } from './ui/button';
import { Label } from './ui/label';

type FormState = {
  name: string;
  description: string;
  template: string;
};

const emptyForm: FormState = {
  name: '',
  description: '',
  template: '',
};

export function PromptTemplatesManager() {
  const {
    templates,
    selectedPromptId,
    isLoading,
    load,
    add,
    update,
    delete: deleteTemplate,
    selectTemplate,
  } = usePromptTemplates();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [status, setStatus] = useState<
    'idle' | 'created' | 'updated' | 'deleted' | 'activated'
  >('idle');
  const [error, setError] = useState<string | null>(null);

  const sortedTemplates = useMemo(
    () =>
      [...templates].sort(
        (a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)
      ),
    [templates]
  );

  const loadFormFromTemplate = (tpl: PromptTemplate | undefined) => {
    if (!tpl) return;
    setForm({
      name: tpl.name ?? '',
      description: tpl.description ?? '',
      template: tpl.template ?? '',
    });
    setEditingId(tpl.id);
    setStatus('idle');
    setError(null);
  };

  // Bootstrap selection once templates are available
  useEffect(() => {
    if (editingId || sortedTemplates.length === 0) return;

    const initialId =
      selectedPromptId ?? sortedTemplates[0]?.id ?? null;
    if (!initialId) return;

    const initialTemplate = sortedTemplates.find((tpl) => tpl.id === initialId);
    if (initialTemplate) {
      loadFormFromTemplate(initialTemplate);
    }
  }, [editingId, selectedPromptId, sortedTemplates]);

  // Ensure templates are loaded (defensive; SidebarApp initializes, but guard for safety)
  useEffect(() => {
    if (sortedTemplates.length === 0 && !isLoading) {
      void load();
    }
  }, [isLoading, load, sortedTemplates.length]);

  const validate = () => {
    if (!form.name.trim()) return 'Template name is required';
    if (form.name.trim().length > 80) return 'Name should be under 80 characters';
    if (!form.template.trim()) return 'Template text cannot be empty';
    return null;
  };

  const handleSave = async () => {
    setError(null);
    setStatus('idle');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      template: form.template.trim(),
    };

    try {
      if (editingId) {
        await update(editingId, payload);
        setStatus('updated');
      } else {
        const created = await add(payload);
        await selectTemplate(created.id);
        loadFormFromTemplate(created);
        setStatus('created');
      }
    } catch {
      setError('Failed to save template. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    const isDefault =
      id === 'default' ||
      sortedTemplates.find((tpl) => tpl.id === id)?.isDefault === true;
    if (isDefault) {
      setError('The default template cannot be deleted.');
      return;
    }

    const confirmDelete = window.confirm('Delete this prompt template?');
    if (!confirmDelete) return;

    setError(null);
    setStatus('idle');

    try {
      await deleteTemplate(id);
      if (editingId === id) {
        setEditingId(null);
      }

      // Choose a sensible fallback selection
      const fallback =
        sortedTemplates.find((tpl) => tpl.id === 'default') ??
        sortedTemplates.find((tpl) => tpl.id !== id);

      if (fallback) {
        await selectTemplate(fallback.id);
        loadFormFromTemplate(fallback);
      } else {
        setEditingId(null);
        setForm(emptyForm);
      }

      setStatus('deleted');
    } catch {
      setError('Failed to delete template. Please try again.');
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      await selectTemplate(id);
      setStatus('activated');
    } catch {
      setError('Failed to set active template.');
    }
  };

  const handleNewTemplate = () => {
    setEditingId(null);
    setForm({
      name: '',
      description: '',
      template: DEFAULT_PROMPT_TEMPLATE.template,
    });
    setStatus('idle');
    setError(null);
  };

  const activeId = selectedPromptId;

  const statusMessage =
    status === 'created'
      ? 'Template created and set as active.'
      : status === 'updated'
        ? 'Template updated.'
        : status === 'deleted'
          ? 'Template deleted.'
          : status === 'activated'
            ? 'Template set as active.'
            : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prompt Templates</CardTitle>
        <Typography variant="body2" color="text.secondary" margin={0}>
          Create, edit, and pick the prompt used for summaries.
        </Typography>
      </CardHeader>
      <CardContent>
        <Stack spacing={2}>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {statusMessage && (
            <Alert variant="success">
              <AlertDescription>{statusMessage}</AlertDescription>
            </Alert>
          )}

          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2" color="text.secondary">
                Saved templates
              </Typography>
              <Button variant="outline" size="sm" onClick={handleNewTemplate} disabled={isLoading}>
                New template
              </Button>
            </Stack>

            {sortedTemplates.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No templates yet. Create one to get started.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {sortedTemplates.map((tpl) => {
                  const isActive = activeId === tpl.id;
                  const isEditing = editingId === tpl.id;
                  const isDefault =
                    tpl.id === 'default' || tpl.isDefault === true;

                  return (
                    <Box
                      key={tpl.id}
                      sx={{
                        border: '1px solid',
                        borderColor: isEditing ? 'primary.main' : 'divider',
                        borderRadius: 2,
                        p: 1.25,
                        backgroundColor: isEditing ? 'primary.light' : 'background.paper',
                        backgroundImage: isEditing
                          ? 'linear-gradient(180deg, rgba(47,111,106,0.10), rgba(47,111,106,0.05))'
                          : 'none',
                      }}
                    >
                      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                        <Box>
                          <Typography variant="subtitle2" color="text.primary">
                            {tpl.name}
                            {isDefault ? ' (Default)' : ''}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.25 }}
                          >
                            {tpl.description || 'No description'} • Updated{' '}
                            {new Date(tpl.updatedAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant={isEditing ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => loadFormFromTemplate(tpl)}
                            disabled={isLoading}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetActive(tpl.id)}
                            disabled={isActive || isLoading}
                          >
                            {isActive ? 'Active' : 'Use'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(tpl.id)}
                            disabled={isDefault || isLoading}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Stack>

          <Stack spacing={1.5}>
            <Typography variant="subtitle2" color="text.secondary">
              {editingId ? 'Edit template' : 'Create template'}
            </Typography>

            <div>
              <Label>Name</Label>
              <TextField
                fullWidth
                size="small"
                value={form.name}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, name: e.target.value }));
                  setStatus('idle');
                  setError(null);
                }}
                placeholder="Concise title (e.g., Research brief)"
                disabled={isLoading}
                inputProps={{ maxLength: 120 }}
              />
            </div>

            <div>
              <Label>Description</Label>
              <TextField
                fullWidth
                size="small"
                value={form.description}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, description: e.target.value }));
                  setStatus('idle');
                  setError(null);
                }}
                placeholder="Optional context for this prompt"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label>Template text</Label>
              <TextField
                fullWidth
                size="small"
                multiline
                minRows={6}
                value={form.template}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, template: e.target.value }));
                  setStatus('idle');
                  setError(null);
                }}
                placeholder="Write the instructions the model should follow..."
                disabled={isLoading}
              />
            </div>

            <Stack direction="row" spacing={1}>
              <Button
                variant="default"
                size="default"
                onClick={handleSave}
                disabled={isLoading}
              >
                {editingId ? 'Save changes' : 'Create template'}
              </Button>
              {editingId && (
                <Button
                  variant="destructive"
                  size="default"
                  onClick={() => handleDelete(editingId)}
                  disabled={
                    isLoading ||
                    editingId === 'default' ||
                    sortedTemplates.find((tpl) => tpl.id === editingId)?.isDefault === true
                  }
                >
                  Delete
                </Button>
              )}
              {!editingId && (
                <Button variant="ghost" size="default" onClick={handleNewTemplate} disabled={isLoading}>
                  Reset
                </Button>
              )}
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

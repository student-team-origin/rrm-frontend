import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateResource, useUpdateResource } from '../hooks/useResourceMutations';
import {
  isResourceFormField,
  resourceFormSchema,
  toResourceFormValues,
  toResourceInput,
  type ResourceFormValues,
} from '../schemas';
import type { Laboratory, Resource, ResourceCategory } from '../types';
import { resourceErrorMessage, serverFieldErrors } from '../utils/resourceErrors';
import { ResourceFormFields } from './ResourceFormFields';

export type ResourceFormDialogProps = {
  /** Resursa editată; lipsește la adăugare. */
  resource?: Resource;
  categories: ResourceCategory[];
  labs: Laboratory[];
  onClose: () => void;
  onSaved: () => void;
};

/**
 * Dialogul de adăugare / editare a unei resurse. Se montează doar cât e deschis,
 * deci la fiecare deschidere pornește cu valorile resursei (sau goale).
 */
export function ResourceFormDialog({
  resource,
  categories,
  labs,
  onClose,
  onSaved,
}: ResourceFormDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const createMutation = useCreateResource();
  const updateMutation = useUpdateResource();
  const [submitError, setSubmitError] = useState<string>();
  const isEdit = resource?.id !== undefined;

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: toResourceFormValues(resource),
  });
  const { isSubmitting } = form.formState;

  const handleSave = form.handleSubmit(async (values) => {
    setSubmitError(undefined);
    const input = toResourceInput(values);
    try {
      if (resource?.id !== undefined) {
        await updateMutation.mutateAsync({ id: resource.id, input });
      } else {
        await createMutation.mutateAsync(input);
      }
      onSaved();
    } catch (error) {
      const fieldErrors = Object.entries(serverFieldErrors(error));
      let shownOnFields = 0;
      fieldErrors.forEach(([field, message]) => {
        if (isResourceFormField(field)) {
          form.setError(field, { type: 'server', message });
          shownOnFields += 1;
        }
      });
      if (shownOnFields === 0) {
        setSubmitError(resourceErrorMessage(error, 'save'));
      }
    }
  });

  return (
    <Dialog
      open
      onClose={isSubmitting ? undefined : onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      aria-labelledby="resource-form-title"
    >
      <DialogTitle id="resource-form-title">
        {isEdit ? 'Editează resursa' : 'Adaugă resursă'}
      </DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="resource-form"
          noValidate
          onSubmit={handleSave}
          spacing={2}
          sx={{ pt: 1 }}
        >
          {submitError && <Alert severity="error">{submitError}</Alert>}
          <ResourceFormFields form={form} categories={categories} labs={labs} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Renunță
        </Button>
        <Button
          type="submit"
          form="resource-form"
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size="1em" color="inherit" /> : undefined}
        >
          Salvează
        </Button>
      </DialogActions>
    </Dialog>
  );
}

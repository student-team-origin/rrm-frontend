import { MenuItem, Stack, TextField } from '@mui/material';
import { Controller, type UseFormReturn } from 'react-hook-form';
import type { ResourceFormValues } from '../schemas';
import type { Laboratory, ResourceCategory } from '../types';

export type ResourceFormFieldsProps = {
  form: UseFormReturn<ResourceFormValues>;
  categories: ResourceCategory[];
  labs: Laboratory[];
};

/** Câmpurile formularului de resursă, cu erorile de validare sub fiecare câmp. */
export function ResourceFormFields({ form, categories, labs }: ResourceFormFieldsProps) {
  const { control } = form;

  return (
    <>
      <Controller
        name="denumire"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Denumire"
            required
            autoFocus
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Controller
          name="categorieId"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              select
              label="Categorie"
              required
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={String(category.id)}>
                  {category.denumire}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="laboratorId"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              select
              label="Laborator"
              required
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            >
              {labs.map((lab) => (
                <MenuItem key={lab.id} value={String(lab.id)}>
                  {lab.denumire}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </Stack>
      <Controller
        name="specificatii"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Specificații"
            multiline
            minRows={3}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
      <Controller
        name="timpPregatireMin"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Timp pregătire (min)"
            type="number"
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
            error={!!fieldState.error}
            helperText={fieldState.error?.message ?? 'Pauza adăugată după fiecare rezervare.'}
          />
        )}
      />
      <Controller
        name="reguliAcces"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Reguli de acces"
            placeholder="ex. Necesită instruire SSM"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
    </>
  );
}

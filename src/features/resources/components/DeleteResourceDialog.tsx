import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useDeleteResource } from '../hooks/useResourceMutations';
import type { Resource } from '../types';
import { resourceErrorMessage } from '../utils/resourceErrors';

export type DeleteResourceDialogProps = {
  resource: Resource;
  onClose: () => void;
  onDeleted: () => void;
};

/** Confirmarea ștergerii unei resurse. La 409 explică de ce resursa nu poate fi ștearsă. */
export function DeleteResourceDialog({ resource, onClose, onDeleted }: DeleteResourceDialogProps) {
  const deleteMutation = useDeleteResource();
  const isDeleting = deleteMutation.isPending;

  const handleConfirm = () => {
    if (resource.id === undefined) {
      return;
    }
    deleteMutation.mutate(resource.id, { onSuccess: onDeleted });
  };

  return (
    <Dialog
      open
      onClose={isDeleting ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="delete-resource-title"
    >
      <DialogTitle id="delete-resource-title">Șterge resursa</DialogTitle>
      <DialogContent>
        {deleteMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {resourceErrorMessage(deleteMutation.error, 'delete')}
          </Alert>
        )}
        <DialogContentText>
          Sigur ștergi resursa „{resource.denumire}”? Operația nu poate fi anulată.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          Renunță
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={handleConfirm}
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size="1em" color="inherit" /> : undefined}
        >
          Șterge
        </Button>
      </DialogActions>
    </Dialog>
  );
}

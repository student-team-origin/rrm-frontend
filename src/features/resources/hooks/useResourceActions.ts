import { useState } from 'react';
import { resourceStatusLabels } from '../../../theme';
import type { Resource, ResourceStatus } from '../types';
import { resourceErrorMessage } from '../utils/resourceErrors';
import { useChangeResourceStatus } from './useResourceMutations';

/** Dialogul deschis în pagină: formularul (adăugare / editare) sau confirmarea ștergerii. */
export type ResourceDialog =
  { type: 'form'; resource?: Resource } | { type: 'delete'; resource: Resource } | null;

/** Mesajul afișat în Snackbar după o acțiune. */
export type ResourceFeedback = { message: string; severity: 'success' | 'error' } | null;

/**
 * Starea acțiunilor din catalog: ce dialog e deschis, mesajul de feedback și
 * schimbarea stării unei resurse direct din meniul rândului.
 */
export function useResourceActions() {
  const [dialog, setDialog] = useState<ResourceDialog>(null);
  const [feedback, setFeedback] = useState<ResourceFeedback>(null);
  const statusMutation = useChangeResourceStatus();

  const closeDialog = () => setDialog(null);

  const notifySuccess = (message: string) => {
    setDialog(null);
    setFeedback({ message, severity: 'success' });
  };

  const changeStatus = (resource: Resource, stare: ResourceStatus) => {
    if (resource.id === undefined) {
      return;
    }
    statusMutation.mutate(
      { id: resource.id, change: { stare } },
      {
        onSuccess: ({ rezervariAnulate }) => {
          const cancelled = rezervariAnulate
            ? ` ${rezervariAnulate} rezervări au fost anulate și utilizatorii notificați.`
            : '';
          setFeedback({
            message: `Starea resursei „${resource.denumire}” este acum ${resourceStatusLabels[stare]}.${cancelled}`,
            severity: 'success',
          });
        },
        onError: (error) =>
          setFeedback({ message: resourceErrorMessage(error, 'status'), severity: 'error' }),
      },
    );
  };

  return {
    dialog,
    feedback,
    openCreate: () => setDialog({ type: 'form' }),
    openEdit: (resource: Resource) => setDialog({ type: 'form', resource }),
    openDelete: (resource: Resource) => setDialog({ type: 'delete', resource }),
    closeDialog,
    notifySuccess,
    clearFeedback: () => setFeedback(null),
    changeStatus,
  };
}

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { formatDateTimeRange } from '../../../shared/utils/formatDate';
import { useDecision } from '../hooks/useDecision';
import {
  OBSERVATION_MAX_LENGTH,
  decisionSchema,
  toDecisionInput,
  type DecisionValues,
} from '../schemas';
import type { ApprovalRequest, DecisionKind } from '../types';
import { decisionErrorMessage, decisionSuccessMessage } from '../utils/approvalRules';

export type DecisionDialogProps = {
  request: ApprovalRequest;
  kind: DecisionKind;
  onClose: () => void;
  /** Primește mesajul de confirmare (unde a ajuns cererea). */
  onDecided: (message: string) => void;
};

const TEXT: Record<DecisionKind, { title: string; field: string; confirm: string }> = {
  approve: { title: 'Aprobă cererea', field: 'Observație (opțională)', confirm: 'Aprobă' },
  reject: { title: 'Respinge cererea', field: 'Motivul respingerii', confirm: 'Respinge' },
};

/** Confirmarea unei decizii: observație opțională la aprobare, motiv obligatoriu la respingere. */
export function DecisionDialog({ request, kind, onClose, onDecided }: DecisionDialogProps) {
  const decision = useDecision();
  const isSaving = decision.isPending;
  const text = TEXT[kind];
  const form = useForm<DecisionValues>({
    resolver: zodResolver(decisionSchema(kind)),
    defaultValues: { observatie: '' },
  });
  const fieldError = form.formState.errors.observatie?.message;

  const handleConfirm = form.handleSubmit((values) => {
    if (request.id === undefined) {
      return;
    }
    decision.mutate(
      { id: request.id, request, kind, input: toDecisionInput(values) },
      { onSuccess: (result) => onDecided(decisionSuccessMessage(result)) },
    );
  });

  const resourceName = request.resursa?.denumire ?? `resursa #${request.resursaId}`;
  const interval =
    request.start && request.sfarsit
      ? ` (${formatDateTimeRange(request.start, request.sfarsit)})`
      : '';
  const requester = request.solicitant?.nume ?? 'solicitant';

  return (
    <Dialog
      open
      onClose={isSaving ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="decision-dialog-title"
    >
      <DialogTitle id="decision-dialog-title">{text.title}</DialogTitle>
      <DialogContent>
        <Stack component="form" id="decision-form" noValidate onSubmit={handleConfirm} spacing={2}>
          {decision.isError && (
            <Alert severity="error">{decisionErrorMessage(decision.error)}</Alert>
          )}
          <DialogContentText>
            Cererea lui {requester} pentru „{resourceName}”{interval}.
            {kind === 'reject' && ' Motivul îl va vedea solicitantul.'}
          </DialogContentText>
          <TextField
            label={text.field}
            multiline
            minRows={2}
            required={kind === 'reject'}
            {...form.register('observatie')}
            error={fieldError !== undefined}
            helperText={fieldError}
            // Cu 1 peste limită: cine depășește limita vede mesajul de validare.
            slotProps={{ htmlInput: { maxLength: OBSERVATION_MAX_LENGTH + 1 } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Renunță
        </Button>
        <Button
          type="submit"
          form="decision-form"
          variant="contained"
          color={kind === 'reject' ? 'error' : 'primary'}
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size="1em" color="inherit" /> : undefined}
        >
          {text.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

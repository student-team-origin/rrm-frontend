import {
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { formatDateTimeRange } from '../../../shared/utils/formatDate';
import { ApprovalHistory } from '../../reservations/components/ApprovalHistory';
import { ReservationStatusChip } from '../../reservations/components/ReservationStatusChip';
import type { ApprovalRequest, DecisionKind } from '../types';
import { pendingLevelLabel } from '../utils/approvalRules';

export type ApprovalRequestCardProps = {
  request: ApprovalRequest;
  /** Lipsește în tab-urile Aprobate / Respinse: acolo cererile doar se consultă. */
  onDecide?: (request: ApprovalRequest, kind: DecisionKind) => void;
  /** Utilizatorul curent: propria cerere nu o poate decide (backend: `AUTO_APROBARE_INTERZISA`). */
  currentUserId?: number;
};

/**
 * O cerere de rezervare: resursa, solicitantul, intervalul, scopul și istoricul aprobărilor, plus
 * butoanele Aprobă / Respinge când cererea așteaptă decizia utilizatorului.
 */
export function ApprovalRequestCard({
  request,
  onDecide,
  currentUserId,
}: ApprovalRequestCardProps) {
  const resourceName = request.resursa?.denumire ?? `Resursa #${request.resursaId}`;
  const interval =
    request.start && request.sfarsit ? formatDateTimeRange(request.start, request.sfarsit) : '—';
  const level = pendingLevelLabel(request.stare);
  const label = `${resourceName}, ${interval}`;
  const isOwnRequest = currentUserId !== undefined && request.solicitantId === currentUserId;

  return (
    <Card variant="outlined" component="article" aria-label={`Cerere ${label}`}>
      <CardContent>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ mb: 1, justifyContent: 'space-between', alignItems: { sm: 'center' } }}
        >
          <Typography variant="h6" component="h2">
            {resourceName}
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {onDecide && level && <Chip label={level} size="small" variant="outlined" />}
            {request.stare && <ReservationStatusChip status={request.stare} />}
          </Stack>
        </Stack>
        <Typography>{interval}</Typography>
        <Typography color="text.secondary">
          {request.solicitant?.nume ?? `Solicitantul #${request.solicitantId}`} ·{' '}
          {request.oreSolicitate ?? '—'} ore · grantul #{request.grantId}
        </Typography>
        {request.scop && <Typography sx={{ mt: 1 }}>{request.scop}</Typography>}
        <Divider sx={{ my: 1.5 }} />
        <ApprovalHistory approvals={request.aprobari ?? []} status={request.stare} />
      </CardContent>
      {onDecide && isOwnRequest && (
        <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Este cererea ta: o decide un alt aprobator.
          </Typography>
        </CardActions>
      )}
      {onDecide && !isOwnRequest && (
        <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
          <Button
            color="error"
            aria-label={`Respinge cererea ${label}`}
            onClick={() => onDecide(request, 'reject')}
          >
            Respinge
          </Button>
          <Button
            variant="contained"
            aria-label={`Aprobă cererea ${label}`}
            onClick={() => onDecide(request, 'approve')}
          >
            Aprobă
          </Button>
        </CardActions>
      )}
    </Card>
  );
}

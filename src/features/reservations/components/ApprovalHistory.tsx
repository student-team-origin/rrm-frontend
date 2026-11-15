import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import type { ReactNode } from 'react';
import { formatDateTime } from '../../../shared/utils/formatDate';
import type { Approval, ReservationStatus } from '../types';
import { APPROVAL_LEVEL_LABELS } from '../utils/reservationRules';

const LEVELS = [1, 2] as const;

/** Starea în care cererea așteaptă decizia fiecărui nivel. */
const PENDING_STATUS_BY_LEVEL: Record<1 | 2, ReservationStatus> = {
  1: 'InAsteptareCoordonator',
  2: 'InAsteptareLaborator',
};

export type ApprovalHistoryProps = {
  approvals: Approval[];
  status: ReservationStatus | undefined;
};

type LevelView = { icon: ReactNode; text: string; detail?: string };

function levelView(
  level: 1 | 2,
  approval: Approval | undefined,
  status: ReservationStatus | undefined,
): LevelView {
  if (approval) {
    const approved = approval.decizie === 'Aprobat';
    const date = approval.dataDecizie ? `, ${formatDateTime(approval.dataDecizie)}` : '';
    return {
      icon: approved ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />,
      text: `${approved ? 'Aprobat' : 'Respins'}${date}`,
      detail: approval.observatie,
    };
  }
  if (status === PENDING_STATUS_BY_LEVEL[level]) {
    return { icon: <HourglassEmptyIcon color="warning" />, text: 'În așteptare' };
  }
  return { icon: <RemoveCircleOutlineIcon color="disabled" />, text: 'Fără decizie' };
}

/** Istoricul aprobărilor pe cele 2 niveluri: decizia, data și observația fiecăruia. */
export function ApprovalHistory({ approvals, status }: ApprovalHistoryProps) {
  return (
    <List dense aria-label="Istoricul aprobărilor" disablePadding>
      {LEVELS.map((level) => {
        const view = levelView(
          level,
          approvals.find((approval) => approval.nivel === level),
          status,
        );
        return (
          <ListItem key={level} disableGutters alignItems="flex-start">
            <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>{view.icon}</ListItemIcon>
            <ListItemText
              primary={`${APPROVAL_LEVEL_LABELS[level]}: ${view.text}`}
              secondary={view.detail}
            />
          </ListItem>
        );
      })}
    </List>
  );
}

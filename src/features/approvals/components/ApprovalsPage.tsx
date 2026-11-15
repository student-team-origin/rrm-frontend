import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Skeleton,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { toApiError } from '../../../api/client';
import { useCurrentUser } from '../../auth/hooks/useCurrentUser';
import { useApprovals } from '../hooks/useApprovals';
import { useApprovalsPageState } from '../hooks/useApprovalsPageState';
import type { ApprovalTab } from '../types';
import { ApprovalRequestCard } from './ApprovalRequestCard';
import { DecisionDialog } from './DecisionDialog';

const TABS: { value: ApprovalTab; label: string; empty: string }[] = [
  { value: 'inAsteptare', label: 'În așteptare', empty: 'Nicio cerere nu așteaptă decizia ta.' },
  { value: 'aprobate', label: 'Aprobate', empty: 'Nu ai aprobat încă nicio cerere.' },
  { value: 'respinse', label: 'Respinse', empty: 'Nu ai respins nicio cerere.' },
];

/**
 * Pagina Aprobări: cererile care așteaptă decizia utilizatorului (Coordonator de grant sau
 * Responsabil de laborator), cu Aprobă / Respinge, și istoricul cererilor aprobate și respinse.
 */
export function ApprovalsPage() {
  const state = useApprovalsPageState();
  const query = useApprovals(state.tab);
  const { data: currentUser } = useCurrentUser();
  const requests = query.data ?? [];
  const current = TABS.find((tab) => tab.value === state.tab) ?? TABS[0];
  const isPendingTab = state.tab === 'inAsteptare';

  return (
    <>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Aprobări
      </Typography>
      <Tabs
        value={state.tab}
        onChange={(_, value: ApprovalTab) => state.setTab(value)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
      </Tabs>

      {query.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => query.refetch()}>
              Reîncearcă
            </Button>
          }
        >
          Cererile nu au putut fi încărcate. {toApiError(query.error).message}
        </Alert>
      )}
      {query.isPending && (
        <Stack spacing={2} aria-label="Se încarcă cererile">
          <Skeleton variant="rounded" height={160} />
          <Skeleton variant="rounded" height={160} />
        </Stack>
      )}
      {query.isSuccess && (
        <Box sx={{ position: 'relative' }}>
          {query.isFetching && (
            <LinearProgress
              aria-label="Se actualizează lista"
              sx={{ position: 'absolute', top: -8, left: 0, right: 0 }}
            />
          )}
          {requests.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
              {current.empty}
            </Typography>
          ) : (
            <Stack spacing={2}>
              {requests.map((request) => (
                <ApprovalRequestCard
                  key={request.id}
                  request={request}
                  onDecide={isPendingTab ? state.openDecision : undefined}
                  currentUserId={currentUser?.id}
                />
              ))}
            </Stack>
          )}
        </Box>
      )}

      {state.decisionTarget && (
        <DecisionDialog
          request={state.decisionTarget.request}
          kind={state.decisionTarget.kind}
          onClose={state.closeDecision}
          onDecided={state.notifyDecided}
        />
      )}
      <Snackbar
        open={state.feedback !== undefined}
        autoHideDuration={5000}
        onClose={state.clearFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {state.feedback ? (
          <Alert severity="success" variant="filled" onClose={state.clearFeedback}>
            {state.feedback}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}

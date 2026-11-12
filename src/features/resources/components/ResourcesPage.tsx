import AddIcon from '@mui/icons-material/Add';
import { Alert, Box, Button, LinearProgress, Snackbar, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { toApiError } from '../../../api/client';
import { useLabs } from '../hooks/useLabs';
import { useResourceActions } from '../hooks/useResourceActions';
import { useResourceCategories } from '../hooks/useResourceCategories';
import { useResourceFilters } from '../hooks/useResourceFilters';
import { useResources } from '../hooks/useResources';
import { DeleteResourceDialog } from './DeleteResourceDialog';
import { ResourceFilterBar } from './ResourceFilterBar';
import { ResourceFormDialog } from './ResourceFormDialog';
import { ResourceRowActions } from './ResourceRowActions';
import { ResourceTable } from './ResourceTable';

/**
 * Pagina Catalog resurse: lista resurselor, cu căutare, filtre și paginare, plus
 * adăugarea, editarea, schimbarea stării și ștergerea unei resurse.
 */
export function ResourcesPage() {
  const filterState = useResourceFilters();
  const resourcesQuery = useResources(filterState.params);
  const labsQuery = useLabs();
  const categoriesQuery = useResourceCategories();
  const actions = useResourceActions();
  const { dialog, feedback } = actions;

  const labs = useMemo(() => labsQuery.data ?? [], [labsQuery.data]);
  const labNames = useMemo(
    () =>
      new Map(
        labs.flatMap((lab) =>
          lab.id !== undefined && lab.denumire ? [[lab.id, lab.denumire] as const] : [],
        ),
      ),
    [labs],
  );

  const isRefreshing = resourcesQuery.isFetching && !resourcesQuery.isPending;

  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 2, justifyContent: 'space-between', alignItems: { sm: 'center' } }}
      >
        <Typography variant="h4" component="h1">
          Catalog resurse
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={actions.openCreate}>
          Adaugă resursă
        </Button>
      </Stack>

      <ResourceFilterBar
        searchText={filterState.searchText}
        filters={filterState.filters}
        categories={categoriesQuery.data ?? []}
        labs={labs}
        canReset={filterState.hasActiveFilters}
        onSearchChange={filterState.setSearchText}
        onCategoryChange={(id) => filterState.setFilter('categorieId', id)}
        onLabChange={(id) => filterState.setFilter('laboratorId', id)}
        onStatusChange={(status) => filterState.setFilter('stare', status)}
        onReset={filterState.reset}
      />

      {resourcesQuery.isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => resourcesQuery.refetch()}>
              Reîncearcă
            </Button>
          }
        >
          Resursele nu au putut fi încărcate. {toApiError(resourcesQuery.error).message}
        </Alert>
      ) : (
        <Box sx={{ position: 'relative' }}>
          {isRefreshing && (
            <LinearProgress
              aria-label="Se actualizează lista"
              sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}
            />
          )}
          <ResourceTable
            resources={resourcesQuery.data?.items ?? []}
            labNames={labNames}
            isLoading={resourcesQuery.isPending}
            total={resourcesQuery.data?.total ?? 0}
            page={filterState.page}
            size={filterState.size}
            onPageChange={filterState.setPage}
            onSizeChange={filterState.setSize}
            renderActions={(resource) => (
              <ResourceRowActions
                resource={resource}
                onEdit={actions.openEdit}
                onDelete={actions.openDelete}
                onChangeStatus={actions.changeStatus}
              />
            )}
          />
        </Box>
      )}

      {dialog?.type === 'form' && (
        <ResourceFormDialog
          resource={dialog.resource}
          categories={categoriesQuery.data ?? []}
          labs={labs}
          onClose={actions.closeDialog}
          onSaved={() => actions.notifySuccess('Resursa a fost salvată.')}
        />
      )}
      {dialog?.type === 'delete' && (
        <DeleteResourceDialog
          resource={dialog.resource}
          onClose={actions.closeDialog}
          onDeleted={() => actions.notifySuccess('Resursa a fost ștearsă.')}
        />
      )}

      <Snackbar
        open={feedback !== null}
        autoHideDuration={5000}
        onClose={actions.clearFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {feedback ? (
          <Alert severity={feedback.severity} variant="filled" onClose={actions.clearFeedback}>
            {feedback.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}

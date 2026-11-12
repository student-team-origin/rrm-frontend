import { Alert, Box, Button, LinearProgress, Typography } from '@mui/material';
import { useMemo } from 'react';
import { toApiError } from '../../../api/client';
import { useLabs } from '../hooks/useLabs';
import { useResourceCategories } from '../hooks/useResourceCategories';
import { useResourceFilters } from '../hooks/useResourceFilters';
import { useResources } from '../hooks/useResources';
import { ResourceFilterBar } from './ResourceFilterBar';
import { ResourceTable } from './ResourceTable';

/** Pagina Catalog resurse: lista resurselor, cu căutare, filtre și paginare. */
export function ResourcesPage() {
  const filterState = useResourceFilters();
  const resourcesQuery = useResources(filterState.params);
  const labsQuery = useLabs();
  const categoriesQuery = useResourceCategories();

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
      <Typography variant="h4" component="h1" gutterBottom>
        Catalog resurse
      </Typography>

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
          />
        </Box>
      )}
    </>
  );
}

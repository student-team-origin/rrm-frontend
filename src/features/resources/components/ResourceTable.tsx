import {
  Link,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import type { ChangeEvent, MouseEvent, ReactNode } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import type { Resource } from '../types';
import { resourceDetailPath } from '../utils/resourcePaths';
import { ResourceStatusChip } from './ResourceStatusChip';

/** Variantele din „Rânduri pe pagină”. */
const PAGE_SIZE_OPTIONS = [10, 20, 50];

const COLUMNS = ['Denumire', 'Categorie', 'Laborator', 'Stare', 'Timp pregătire (min)'];
const RIGHT_ALIGNED = new Set(['Timp pregătire (min)', 'Acțiuni']);
const SKELETON_ROWS = 5;

function labName(labNames: ReadonlyMap<number, string>, labId: number | undefined): string {
  return (labId !== undefined && labNames.get(labId)) || '—';
}

export type ResourceTableProps = {
  resources: Resource[];
  /** Numele laboratoarelor, după id (din `GET /labs`). */
  labNames: ReadonlyMap<number, string>;
  isLoading: boolean;
  total: number;
  page: number;
  size: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  /** Butoanele din coloana „Acțiuni” pentru o resursă. */
  renderActions?: (resource: Resource) => ReactNode;
};

/**
 * Tabelul catalogului de resurse, cu paginare. Pe ecrane mici se derulează orizontal. Click pe un
 * rând (sau pe denumire) deschide pagina de detaliu a resursei; butoanele din „Acțiuni” nu.
 */
export function ResourceTable({
  resources,
  labNames,
  isLoading,
  total,
  page,
  size,
  onPageChange,
  onSizeChange,
  renderActions,
}: ResourceTableProps) {
  const navigate = useNavigate();
  const columns = renderActions ? [...COLUMNS, 'Acțiuni'] : COLUMNS;
  const handleSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSizeChange(Number(event.target.value));
  };
  const handleRowClick = (event: MouseEvent<HTMLElement>, resource: Resource) => {
    // Linkul de pe denumire navighează singur (și cu Ctrl/clic mijlociu, în tab nou).
    if (resource.id === undefined || (event.target as HTMLElement).closest('a')) {
      return;
    }
    navigate(resourceDetailPath(resource.id));
  };

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table size="small" aria-label="Resurse">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column}
                  align={RIGHT_ALIGNED.has(column) ? 'right' : 'left'}
                  sx={{ fontWeight: 'fontWeightBold', whiteSpace: 'nowrap' }}
                >
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading &&
              Array.from({ length: SKELETON_ROWS }, (_, row) => (
                <TableRow key={row} data-testid="resource-skeleton-row">
                  {columns.map((column) => (
                    <TableCell key={column}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading && resources.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    Nu există resurse pentru filtrele alese
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              resources.map((resource) => (
                <TableRow
                  key={resource.id}
                  hover
                  onClick={(event) => handleRowClick(event, resource)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell sx={{ fontWeight: 'fontWeightMedium', whiteSpace: 'nowrap' }}>
                    {resource.id === undefined ? (
                      resource.denumire
                    ) : (
                      <Link
                        component={RouterLink}
                        to={resourceDetailPath(resource.id)}
                        color="inherit"
                        underline="hover"
                      >
                        {resource.denumire}
                      </Link>
                    )}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {resource.categorie?.denumire ?? '—'}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {labName(labNames, resource.laboratorId)}
                  </TableCell>
                  <TableCell>
                    {resource.stare ? <ResourceStatusChip status={resource.stare} /> : '—'}
                  </TableCell>
                  <TableCell align="right">{resource.timpPregatireMin ?? '—'}</TableCell>
                  {renderActions && (
                    <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                      {renderActions(resource)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={size}
        rowsPerPageOptions={PAGE_SIZE_OPTIONS}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={handleSizeChange}
        labelRowsPerPage="Rânduri pe pagină:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} din ${count}`}
        getItemAriaLabel={(type) => (type === 'next' ? 'Pagina următoare' : 'Pagina anterioară')}
        sx={{
          '& .MuiTablePagination-toolbar': { flexWrap: 'wrap', justifyContent: 'flex-end' },
          '& .MuiTablePagination-spacer': { display: { xs: 'none', sm: 'block' } },
        }}
      />
    </Paper>
  );
}

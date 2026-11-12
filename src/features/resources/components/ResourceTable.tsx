import {
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
import type { ChangeEvent } from 'react';
import type { Resource } from '../types';
import { ResourceStatusChip } from './ResourceStatusChip';

/** Variantele din „Rânduri pe pagină”. */
const PAGE_SIZE_OPTIONS = [10, 20, 50];

const COLUMNS = ['Denumire', 'Categorie', 'Laborator', 'Stare', 'Timp pregătire (min)'];
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
};

/** Tabelul catalogului de resurse, cu paginare. Pe ecrane mici se derulează orizontal. */
export function ResourceTable({
  resources,
  labNames,
  isLoading,
  total,
  page,
  size,
  onPageChange,
  onSizeChange,
}: ResourceTableProps) {
  const handleSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSizeChange(Number(event.target.value));
  };

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table size="small" aria-label="Resurse">
          <TableHead>
            <TableRow>
              {COLUMNS.map((column, index) => (
                <TableCell
                  key={column}
                  align={index === COLUMNS.length - 1 ? 'right' : 'left'}
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
                  {COLUMNS.map((column) => (
                    <TableCell key={column}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading && resources.length === 0 && (
              <TableRow>
                <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    Nu există resurse pentru filtrele alese
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              resources.map((resource) => (
                <TableRow key={resource.id} hover>
                  <TableCell sx={{ fontWeight: 'fontWeightMedium', whiteSpace: 'nowrap' }}>
                    {resource.denumire}
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

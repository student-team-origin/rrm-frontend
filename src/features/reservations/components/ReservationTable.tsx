import {
  Button,
  Paper,
  Skeleton,
  Stack,
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
import { formatDateTimeRange } from '../../../shared/utils/formatDate';
import type { Reservation } from '../types';
import { canCancel } from '../utils/reservationRules';
import { ReservationStatusChip } from './ReservationStatusChip';

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const COLUMNS = ['Resursă', 'Interval', 'Ore', 'Stare', 'Acțiuni'];
const RIGHT_ALIGNED = new Set(['Ore', 'Acțiuni']);
const SKELETON_ROWS = 5;

export type ReservationTableProps = {
  reservations: Reservation[];
  /** Numele resurselor, după id. */
  resourceNames: ReadonlyMap<number, string>;
  isLoading: boolean;
  total: number;
  page: number;
  size: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  onOpenDetail: (reservation: Reservation) => void;
  onCancel: (reservation: Reservation) => void;
};

/** Tabelul „Rezervările mele”, cu paginare. Pe ecrane mici se derulează orizontal. */
export function ReservationTable(props: ReservationTableProps) {
  const { reservations, resourceNames, isLoading, total, page, size } = props;

  const resourceName = (reservation: Reservation) =>
    (reservation.resursaId !== undefined && resourceNames.get(reservation.resursaId)) ||
    `Resursa #${reservation.resursaId ?? '—'}`;

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table size="small" aria-label="Rezervările mele">
          <TableHead>
            <TableRow>
              {COLUMNS.map((column) => (
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
                <TableRow key={row}>
                  {COLUMNS.map((column) => (
                    <TableCell key={column}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading && reservations.length === 0 && (
              <TableRow>
                <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    Nu ai rezervări pentru filtrul ales
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              reservations.map((reservation) => (
                <TableRow key={reservation.id} hover>
                  <TableCell sx={{ fontWeight: 'fontWeightMedium', whiteSpace: 'nowrap' }}>
                    {resourceName(reservation)}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {reservation.start && reservation.sfarsit
                      ? formatDateTimeRange(reservation.start, reservation.sfarsit)
                      : '—'}
                  </TableCell>
                  <TableCell align="right">{reservation.oreSolicitate ?? '—'}</TableCell>
                  <TableCell>
                    {reservation.stare ? <ReservationStatusChip status={reservation.stare} /> : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Button size="small" onClick={() => props.onOpenDetail(reservation)}>
                        Detalii
                      </Button>
                      {canCancel(reservation) && (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => props.onCancel(reservation)}
                        >
                          Anulează
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
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
        onPageChange={(_, newPage) => props.onPageChange(newPage)}
        onRowsPerPageChange={(event: ChangeEvent<HTMLInputElement>) =>
          props.onSizeChange(Number(event.target.value))
        }
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

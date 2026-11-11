import { Paper, Typography } from '@mui/material';

/**
 * Pagina Catalog resurse.
 *
 * Deocamdată este un schelet; tabelul, filtrele și formularele se adaugă în tichetele
 * „Pagina Catalog resurse” și „Formular adăugare/editare resursă și ștergere”.
 */
export function ResourcesPage() {
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Catalog resurse
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary">Lista resurselor va apărea aici.</Typography>
      </Paper>
    </>
  );
}

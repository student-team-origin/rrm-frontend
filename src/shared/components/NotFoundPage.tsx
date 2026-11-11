import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

/** Pagina afișată pentru o adresă inexistentă. */
export function NotFoundPage() {
  return (
    <Stack spacing={2} alignItems="flex-start">
      <Typography variant="h4" component="h1">
        Pagina nu există
      </Typography>
      <Button component={Link} to="/" variant="contained">
        Înapoi la pagina principală
      </Button>
    </Stack>
  );
}

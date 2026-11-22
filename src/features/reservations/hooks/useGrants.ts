import { useQuery } from '@tanstack/react-query';
import { getGrants } from '../api';
import { reservationKeys } from './reservationKeys';

/** Granturile pe care utilizatorul poate rezerva, cu orele rămase din fiecare. */
export function useGrants() {
  return useQuery({ queryKey: reservationKeys.grants(), queryFn: getGrants });
}

import { apiClient } from '../../api/client';
import type {
  CancelReservationInput,
  Reservation,
  ReservationDetail,
  ReservationListParams,
  ReservationPage,
} from './types';

/** `GET /reservations`: rezervările utilizatorului curent, filtrate și paginate. */
export async function getMyReservations(params: ReservationListParams): Promise<ReservationPage> {
  const { data } = await apiClient.get<ReservationPage>('/reservations', { params });
  return data;
}

/** `GET /reservations/{id}`: detaliul unei rezervări, cu istoricul aprobărilor. */
export async function getReservation(id: number): Promise<ReservationDetail> {
  const { data } = await apiClient.get<ReservationDetail>(`/reservations/${id}`);
  return data;
}

/** `POST /reservations/{id}/cancel`: anulează rezervarea; intervalul se eliberează. */
export async function cancelReservation(
  id: number,
  input: CancelReservationInput,
): Promise<Reservation> {
  const { data } = await apiClient.post<Reservation>(`/reservations/${id}/cancel`, input);
  return data;
}

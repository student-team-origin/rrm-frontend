import type { components, operations } from '../../api/schema';

/** O rezervare (schema `Rezervare`). */
export type Reservation = components['schemas']['Rezervare'];

/** Detaliul unei rezervări, cu resursa, solicitantul și aprobările (schema `RezervareDetaliu`). */
export type ReservationDetail = components['schemas']['RezervareDetaliu'];

/** Starea unei rezervări (enumerarea `StareRezervare`). */
export type ReservationStatus = components['schemas']['StareRezervare'];

/** O decizie din istoricul aprobărilor (schema `Aprobare`). */
export type Approval = components['schemas']['Aprobare'];

/** Parametrii acceptați de `GET /reservations` (stare, interval, paginare). */
export type ReservationListParams = NonNullable<
  operations['getReservations']['parameters']['query']
>;

/** Răspunsul paginat al `GET /reservations`. */
export type ReservationPage =
  operations['getReservations']['responses'][200]['content']['application/json'];

/** Corpul opțional al cererii `POST /reservations/{id}/cancel`. */
export type CancelReservationInput = NonNullable<
  operations['postReservationsByReservationIdCancel']['requestBody']
>['content']['application/json'];

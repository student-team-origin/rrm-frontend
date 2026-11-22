import type { components, operations } from '../../api/schema';

/** O resursă din catalog (schema `Resursa`). */
export type Resource = components['schemas']['Resursa'];

/** Starea unei resurse: Activa, Mentenanta sau Defecta. */
export type ResourceStatus = components['schemas']['StareResursa'];

/** Un laborator (schema `Laborator`). */
export type Laboratory = components['schemas']['Laborator'];

/** O categorie de resurse (schema `CategorieResursa`). */
export type ResourceCategory = components['schemas']['CategorieResursa'];

/** Parametrii acceptați de `GET /resources` (căutare, filtre, paginare). */
export type ResourceListParams = NonNullable<operations['getResources']['parameters']['query']>;

/** Răspunsul paginat al `GET /resources`. */
export type ResourcePage =
  operations['getResources']['responses'][200]['content']['application/json'];

/** Filtrele din bara de filtre a catalogului (fără paginare). */
export type ResourceFilters = Pick<
  ResourceListParams,
  'q' | 'categorieId' | 'laboratorId' | 'stare'
>;

/** Corpul cererilor `POST /resources` și `PUT /resources/{id}` (schema `ResursaCreate`). */
export type ResourceInput = components['schemas']['ResursaCreate'];

/** Corpul cererii `PATCH /resources/{id}/status`. */
export type ResourceStatusChange =
  operations['patchResourcesByResourceIdStatus']['requestBody']['content']['application/json'];

/**
 * Un interval în care resursa este ocupată (schema `IntervalOcupat`). `sfarsit` include timpul de
 * pregătire al resursei.
 */
export type OccupiedInterval = components['schemas']['IntervalOcupat'];

/** Parametrii `GET /resources/{id}/availability`: intervalul afișat în calendar (ISO 8601). */
export type AvailabilityRange =
  operations['getResourcesByResourceIdAvailability']['parameters']['query'];

/** Răspunsul `PATCH /resources/{id}/status`: resursa și numărul de rezervări anulate. */
export type ResourceStatusChangeResult =
  operations['patchResourcesByResourceIdStatus']['responses'][200]['content']['application/json'];

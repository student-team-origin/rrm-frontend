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

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Resource } from '../types';
import { SEARCH_DEBOUNCE_MS } from './useResourceFilters';
import { useResources } from './useResources';

/** Câte resurse se afișează în selector; restul se găsesc scriind în câmp. */
export const RESOURCE_PICKER_SIZE = 20;

/**
 * Resursele din selectorul calendarului: căutarea și filtrul pe laborator se fac pe server
 * (`GET /resources?q=...&laboratorId=...`), deci orice resursă poate fi găsită, oricâte ar fi.
 * Textul tastat ajunge în cerere după {@link SEARCH_DEBOUNCE_MS} ms. Resursa aleasă rămâne
 * printre opțiuni chiar dacă nu se potrivește cu căutarea curentă.
 *
 * @param labId laboratorul după care se filtrează lista (toate, dacă lipsește)
 * @param selected resursa aleasă acum, dacă există
 */
export function useResourcePicker(labId: number | undefined, selected: Resource | undefined) {
  const [query, setQuery] = useState<string>();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const resources = useResources({
    q: query,
    laboratorId: labId,
    page: 0,
    size: RESOURCE_PICKER_SIZE,
  });

  const found = resources.data?.items;
  const options = useMemo(() => {
    const items = found ?? [];
    return selected && !items.some((item) => item.id === selected.id)
      ? [selected, ...items]
      : items;
  }, [found, selected]);

  /** Textul din câmp; un text gol readuce primele resurse. */
  const search = (text: string) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(text.trim() || undefined), SEARCH_DEBOUNCE_MS);
  };

  return {
    options,
    /** Numărul total de resurse care se potrivesc (poate fi mai mare decât lista afișată). */
    total: resources.data?.total ?? 0,
    shown: found?.length ?? 0,
    isLoading: resources.isFetching,
    search,
  };
}

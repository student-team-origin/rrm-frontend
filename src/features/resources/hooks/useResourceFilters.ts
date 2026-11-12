import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ResourceFilters, ResourceListParams } from '../types';

/** Întârzierea căutării text, în milisecunde. */
export const SEARCH_DEBOUNCE_MS = 300;

/** Numărul implicit de resurse pe pagină. */
export const DEFAULT_PAGE_SIZE = 20;

const EMPTY_FILTERS: ResourceFilters = {};

/**
 * Starea locală a barei de filtre și a paginării din catalog.
 *
 * Textul de căutare se actualizează imediat în câmp, dar ajunge în `params` abia după
 * {@link SEARCH_DEBOUNCE_MS} ms. Orice schimbare de filtru readuce lista la prima pagină.
 */
export function useResourceFilters() {
  const [searchText, setSearchTextState] = useState('');
  const [filters, setFilters] = useState<ResourceFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [size, setSizeState] = useState(DEFAULT_PAGE_SIZE);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const setSearchText = useCallback((text: string) => {
    setSearchTextState(text);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const q = text.trim() || undefined;
      setFilters((current) => (current.q === q ? current : { ...current, q }));
      setPage(0);
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  const setFilter = useCallback(
    <K extends Exclude<keyof ResourceFilters, 'q'>>(key: K, value: ResourceFilters[K]) => {
      setFilters((current) => ({ ...current, [key]: value }));
      setPage(0);
    },
    [],
  );

  const setSize = useCallback((value: number) => {
    setSizeState(value);
    setPage(0);
  }, []);

  const reset = useCallback(() => {
    clearTimeout(debounceRef.current);
    setSearchTextState('');
    setFilters(EMPTY_FILTERS);
    setPage(0);
  }, []);

  const params = useMemo<ResourceListParams>(
    () => ({ ...filters, page, size }),
    [filters, page, size],
  );

  const hasActiveFilters = searchText !== '' || Object.values(filters).some((v) => v !== undefined);

  return {
    searchText,
    filters,
    params,
    page,
    size,
    hasActiveFilters,
    setSearchText,
    setFilter,
    setPage,
    setSize,
    reset,
  };
}

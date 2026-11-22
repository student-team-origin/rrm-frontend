import { act, renderHook } from '@testing-library/react';
import { NOW_REFRESH_MS, useNow } from './useNow';

describe('useNow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-22T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('se actualizează la fiecare minut, nu rămâne la momentul încărcării', () => {
    const { result } = renderHook(() => useNow());
    expect(result.current).toEqual(new Date('2026-11-22T10:00:00Z'));

    act(() => {
      vi.advanceTimersByTime(NOW_REFRESH_MS);
    });

    expect(result.current).toEqual(new Date('2026-11-22T10:01:00Z'));
  });
});

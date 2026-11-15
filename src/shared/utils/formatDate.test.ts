import { formatDateTime, formatDateTimeRange } from './formatDate';

describe('formatDateTimeRange', () => {
  it('scrie data o singură dată pentru un interval din aceeași zi', () => {
    const start = new Date(2026, 10, 16, 10, 0);
    const end = new Date(2026, 10, 16, 12, 30);

    expect(formatDateTimeRange(start, end)).toBe(`${formatDateTime(start)}–12:30`);
  });

  it('scrie ambele date pentru un interval peste miezul nopții', () => {
    const start = new Date(2026, 10, 16, 22, 0);
    const end = new Date(2026, 10, 17, 2, 0);

    expect(formatDateTimeRange(start, end)).toBe(
      `${formatDateTime(start)} – ${formatDateTime(end)}`,
    );
  });
});

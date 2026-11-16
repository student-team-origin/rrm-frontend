import { reservationStatusColors } from '../../../theme';
import { toCalendarEvents } from './calendarEvents';

const contrast = (background: string) => `text-on-${background}`;

describe('toCalendarEvents', () => {
  it('transformă intervalele în evenimente colorate după stare, cu sfârșitul blocat', () => {
    const events = toCalendarEvents(
      [
        {
          start: '2026-11-16T08:00:00Z',
          sfarsit: '2026-11-16T10:15:00Z',
          stare: 'Aprobata',
        },
        {
          start: '2026-11-16T12:00:00Z',
          sfarsit: '2026-11-16T13:00:00Z',
          stare: 'InAsteptareCoordonator',
        },
      ],
      contrast,
    );

    expect(events).toEqual([
      expect.objectContaining({
        title: 'Aprobată',
        start: '2026-11-16T08:00:00Z',
        end: '2026-11-16T10:15:00Z',
        backgroundColor: reservationStatusColors.Aprobata,
        borderColor: reservationStatusColors.Aprobata,
        textColor: `text-on-${reservationStatusColors.Aprobata}`,
      }),
      expect.objectContaining({
        title: 'Așteaptă coordonatorul',
        backgroundColor: reservationStatusColors.InAsteptareCoordonator,
      }),
    ]);
    expect(new Set(events.map((event) => event.id)).size).toBe(2);
  });

  it('ignoră intervalele incomplete', () => {
    expect(
      toCalendarEvents([{ start: '2026-11-16T08:00:00Z', stare: 'Aprobata' }], contrast),
    ).toEqual([]);
  });
});

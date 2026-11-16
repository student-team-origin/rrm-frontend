import dayjs from 'dayjs';
import { reservationStatusColors, resourceStatusColors } from '../../../theme';
import {
  EVENT_CLASS,
  toCalendarEvents,
  toUnavailableEvents,
  visibleHours,
  type EventColors,
} from './calendarEvents';

const COLORS: EventColors = {
  getContrastText: (background) => `text-on-${background}`,
  tint: (color) => `tint-of-${color}`,
  text: 'dark-text',
};

describe('toCalendarEvents', () => {
  it('colorează rezervarea după stare și afișează separat timpul de pregătire', () => {
    const events = toCalendarEvents(
      [{ start: '2026-11-16T08:00:00Z', sfarsit: '2026-11-16T10:15:00Z', stare: 'Aprobata' }],
      15,
      COLORS,
    );

    expect(events).toEqual([
      expect.objectContaining({
        title: 'Aprobată',
        start: '2026-11-16T08:00:00Z',
        end: '2026-11-16T10:00:00.000Z',
        backgroundColor: reservationStatusColors.Aprobata,
        borderColor: reservationStatusColors.Aprobata,
        textColor: `text-on-${reservationStatusColors.Aprobata}`,
        extendedProps: { kind: 'reservation' },
      }),
      expect.objectContaining({
        title: 'Pregătire',
        start: '2026-11-16T10:00:00.000Z',
        end: '2026-11-16T10:15:00Z',
        classNames: [EVENT_CLASS.buffer],
        extendedProps: { kind: 'buffer' },
      }),
    ]);
    expect(new Set(events.map((event) => event.id)).size).toBe(2);
  });

  it('afișează cererile în așteptare cu fundal deschis și chenar punctat', () => {
    const [event] = toCalendarEvents(
      [
        {
          start: '2026-11-16T12:00:00Z',
          sfarsit: '2026-11-16T13:00:00Z',
          stare: 'InAsteptareCoordonator',
        },
      ],
      0,
      COLORS,
    );

    expect(event).toEqual(
      expect.objectContaining({
        title: 'Așteaptă coordonatorul',
        end: '2026-11-16T13:00:00Z',
        backgroundColor: `tint-of-${reservationStatusColors.InAsteptareCoordonator}`,
        borderColor: reservationStatusColors.InAsteptareCoordonator,
        textColor: 'dark-text',
        classNames: [EVENT_CLASS.pending],
      }),
    );
  });

  it('nu separă pregătirea când ar ocupa tot intervalul', () => {
    const events = toCalendarEvents(
      [{ start: '2026-11-16T08:00:00Z', sfarsit: '2026-11-16T08:10:00Z', stare: 'Activa' }],
      15,
      COLORS,
    );

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual(expect.objectContaining({ end: '2026-11-16T08:10:00Z' }));
  });

  it('ignoră intervalele incomplete', () => {
    expect(
      toCalendarEvents([{ start: '2026-11-16T08:00:00Z', stare: 'Aprobata' }], 0, COLORS),
    ).toEqual([]);
  });
});

describe('toUnavailableEvents', () => {
  const range = { from: '2026-11-16T00:00:00.000Z', to: '2026-11-23T00:00:00.000Z' };

  it('marchează ca indisponibilă perioada afișată, de acum înainte', () => {
    const now = new Date('2026-11-18T09:30:00.000Z');

    expect(toUnavailableEvents('Mentenanta', range, now)).toEqual([
      expect.objectContaining({
        title: 'Mentenanță',
        start: now.toISOString(),
        end: range.to,
        display: 'background',
        backgroundColor: resourceStatusColors.Mentenanta,
      }),
    ]);
  });

  it('nu marchează nimic pentru o resursă activă sau o perioadă trecută', () => {
    expect(toUnavailableEvents('Activa', range, new Date('2026-11-18T00:00:00Z'))).toEqual([]);
    expect(toUnavailableEvents('Defecta', range, new Date('2026-12-01T00:00:00Z'))).toEqual([]);
  });
});

describe('visibleHours', () => {
  const at = (hour: number, minute = 0) =>
    dayjs('2026-11-16').hour(hour).minute(minute).toISOString();

  it('afișează programul de lucru când intervalele încap în el', () => {
    expect(visibleHours([{ start: at(9), sfarsit: at(11) }])).toEqual({
      slotMinTime: '08:00:00',
      slotMaxTime: '18:00:00',
    });
  });

  it('extinde orele cât să încapă rezervările de dimineață și de seară', () => {
    expect(
      visibleHours([
        { start: at(6, 30), sfarsit: at(8) },
        { start: at(19), sfarsit: at(20, 15) },
      ]),
    ).toEqual({ slotMinTime: '06:00:00', slotMaxTime: '21:00:00' });
  });

  it('afișează ziua întreagă pentru un interval care trece peste miezul nopții', () => {
    expect(
      visibleHours([{ start: at(22), sfarsit: dayjs(at(2)).add(1, 'day').toISOString() }]),
    ).toEqual({ slotMinTime: '00:00:00', slotMaxTime: '24:00:00' });
  });

  it('un interval care se termină la miezul nopții extinde doar sfârșitul zilei', () => {
    expect(
      visibleHours([{ start: at(20), sfarsit: dayjs(at(0)).add(1, 'day').toISOString() }]),
    ).toEqual({ slotMinTime: '08:00:00', slotMaxTime: '24:00:00' });
  });
});

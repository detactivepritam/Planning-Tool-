export type Shift = {
  id: string;
  teamId: string;
  dayIndex: number;
  title: string;
  start: string;
  end: string;
  breakDuration: string;
  type: string;
  notes: string;
  published: boolean;
  openShift: boolean;
};

export type EventItem = {
  id: string;
  dayIndex: number;
  title: string;
  start?: string;
  end?: string;
  notes: string;
};

export type TeamRow = {
  id: string;
  name: string;
  label: string;
};

export const teamRows: TeamRow[] = [
  { id: 'general', name: 'Algemeen', label: 'Team' }
];

export const shiftTypeOptions = ['Standard', 'Opening', 'Closing', 'Meeting', 'Training'];

export function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function createWeekStart(date = new Date()) {
  const next = new Date(date);
  const day = next.getDay() || 7;
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - day + 1);
  return next;
}

export function weekKey(weekStart: Date) {
  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);
  const thursday = new Date(start);
  thursday.setDate(thursday.getDate() + 3);
  const year = thursday.getFullYear();
  const firstWeekStart = createWeekStart(new Date(year, 0, 4));
  const diff = Math.floor((start.getTime() - firstWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
  return `${year}-W${pad(diff)}`;
}

export function getWeekDays(weekStart: Date) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    return date;
  });
}

export function formatWeekLabel(weekStart: Date) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const start = `${pad(weekStart.getDate())} ${weekStart.toLocaleDateString('en-GB', { month: 'short' })}`;
  const end = `${pad(weekEnd.getDate())} ${weekEnd.toLocaleDateString('en-GB', { month: 'short' })}`;
  return `${start} - ${end}`;
}

export function formatDayHeader(date: Date) {
  return `${date.toLocaleDateString('en-GB', { weekday: 'short' })} ${pad(date.getDate())} ${date.toLocaleDateString('en-GB', { month: 'short' })}`;
}

export function defaultShifts(): Shift[] {
  return [
    {
      id: 'shift-1',
      teamId: 'general',
      dayIndex: 0,
      title: 'Opening',
      start: '09:00',
      end: '17:00',
      breakDuration: '00:30',
      type: 'Opening',
      notes: 'Morning coverage',
      published: false,
      openShift: false
    },
    
  ];
}

export function defaultEvents(): EventItem[] {
  return [
    {
      id: 'event-1',
      dayIndex: 3,
      title: 'Team briefing',
      start: '09:00',
      end: '10:00',
      notes: 'Weekly check-in'
    }
  ];
}
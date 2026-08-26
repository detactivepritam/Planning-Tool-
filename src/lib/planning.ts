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
  shiftDate?: string;
  teamMemberId?: string | null;
};

export type EventItem = {
  id: string;
  dayIndex: number;
  title: string;
  start?: string;
  end?: string;
  notes: string;
  eventDate?: string;
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

export function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  return `${y}-${m}-${d}`;
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

export function getDayIndexFromDate(dateStr: string, weekStart: Date): number {
  if (!dateStr) return 0;
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  return diff >= 0 && diff < 7 ? diff : 0;
}

export function defaultShifts(): Shift[] {
  return [];
}

export function defaultEvents(): EventItem[] {
  return [];
}
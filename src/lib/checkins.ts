import { useCallback, useEffect, useState } from 'react';

export type Mood = 1 | 2 | 3 | 4 | 5;
export interface CheckIn {
  id: string;
  date: string;
  mood: Mood;
  note: string;
}

export const MOODS: { value: Mood; label: string }[] = [
  { value: 1, label: 'Very low' },
  { value: 2, label: 'Low' },
  { value: 3, label: 'Okay' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Great' },
];

export const NOTE_MAX = 500;
const STORAGE_KEY = 'mhc.checkins.v1';
const CHANGE_EVENT = 'mhc:checkins-changed';

export class CheckInStorageError extends Error {
  constructor() {
    super('This browser could not update your check-ins. Allow site storage or try another browser, then try again.');
    this.name = 'CheckInStorageError';
  }
}

function isMood(value: unknown): value is Mood {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5;
}

function isCheckIn(value: unknown): value is CheckIn {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === 'string' && item.id.trim().length > 0
    && typeof item.date === 'string'
    && /^\d{4}-\d{2}-\d{2}T/.test(item.date)
    && Number.isFinite(Date.parse(item.date))
    && isMood(item.mood)
    && typeof item.note === 'string' && item.note.length <= NOTE_MAX;
}

function readCheckIns(): CheckIn[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    throw new CheckInStorageError();
  }
  try {
    if (!raw) return [];
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    const seen = new Set<string>();
    return data.filter(isCheckIn)
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
      .filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      })
      .map(({ id, date, mood, note }) => ({ id, date, mood, note }));
  } catch {
    return [];
  }
}

export function loadCheckIns(): CheckIn[] {
  try { return readCheckIns(); }
  catch { return []; }
}

function notifyChange() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(CHANGE_EVENT));
}

function saveCheckIns(entries: CheckIn[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // A failed write must not be reported as a successful save.
    throw new CheckInStorageError();
  }
  notifyChange();
}

export function addCheckIn(input: { mood: Mood; note: string }): CheckIn {
  if (!isMood(input.mood) || typeof input.note !== 'string') throw new Error('Choose a valid mood and enter a text note.');
  const entry: CheckIn = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    mood: input.mood,
    note: input.note.trim().slice(0, NOTE_MAX),
  };
  const entries = [entry, ...readCheckIns()].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  saveCheckIns(entries);
  return entry;
}

export function deleteCheckIn(id: string): void {
  saveCheckIns(readCheckIns().filter((item) => item.id !== id));
}

export function clearCheckIns(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    throw new CheckInStorageError();
  }
  notifyChange();
}

export function getWeeklySummary(checkIns: CheckIn[], now = Date.now()): { count: number; average: number | null; label: string | null } {
  const since = now - 7 * 24 * 60 * 60 * 1000;
  const recent = checkIns.filter(({ date }) => {
    const time = Date.parse(date);
    return time >= since && time <= now;
  });
  if (recent.length === 0) return { count: 0, average: null, label: null };
  const average = recent.reduce((sum, item) => sum + item.mood, 0) / recent.length;
  return { count: recent.length, average, label: MOODS[Math.round(average) - 1].label };
}

export function useCheckIns(): {
  checkIns: CheckIn[];
  add: (input: { mood: Mood; note: string }) => CheckIn;
  remove: (id: string) => void;
  clear: () => void;
} {
  const [checkIns, setCheckIns] = useState(loadCheckIns);
  const refresh = useCallback(() => setCheckIns(loadCheckIns()), []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) refresh();
    };
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    refresh();
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);

  const add = useCallback((input: { mood: Mood; note: string }) => {
    const entry = addCheckIn(input);
    refresh();
    return entry;
  }, [refresh]);
  const remove = useCallback((id: string) => { deleteCheckIn(id); refresh(); }, [refresh]);
  const clear = useCallback(() => { clearCheckIns(); refresh(); }, [refresh]);
  return { checkIns, add, remove, clear };
}

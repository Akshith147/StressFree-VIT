import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addCheckIn, CheckInStorageError, clearCheckIns, deleteCheckIn, getWeeklySummary, loadCheckIns, NOTE_MAX, type CheckIn, type Mood } from './checkins';

const key = 'mhc.checkins.v1';
class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}

let storage: MemoryStorage;
function entry(id: string, date: string, mood: Mood = 3): CheckIn {
  return { id, date, mood, note: '' };
}

beforeEach(() => {
  storage = new MemoryStorage();
  vi.stubGlobal('localStorage', storage);
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-18T16:00:00.000Z'));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('check-in persistence', () => {
  it('starts empty and saves entries newest first across repeated loads', () => {
    expect(loadCheckIns()).toEqual([]);
    const first = addCheckIn({ mood: 2, note: 'A busy day' });
    vi.setSystemTime(new Date('2026-10-18T17:00:00.000Z'));
    const second = addCheckIn({ mood: 5, note: '' });
    expect(first.id).not.toBe(second.id);
    expect(second.date).toBe('2026-10-18T17:00:00.000Z');
    expect(loadCheckIns()).toEqual([second, first]);
    expect(JSON.parse(storage.getItem(key)!)).toEqual([second, first]);
  });

  it('trims notes, enforces 500 characters, and permits an empty note', () => {
    expect(addCheckIn({ mood: 3, note: '  hello  ' }).note).toBe('hello');
    expect(addCheckIn({ mood: 1, note: '  ' + 'x'.repeat(600) + '  ' }).note).toBe('x'.repeat(NOTE_MAX));
    expect(addCheckIn({ mood: 4, note: '   ' }).note).toBe('');
  });

  it.each(['{broken', 'null', '{}', '42', '"text"'])('handles invalid storage JSON: %s', (raw) => {
    storage.setItem(key, raw);
    expect(loadCheckIns()).toEqual([]);
  });

  it('filters malformed entries, duplicate ids and strips extra properties', () => {
    const valid = entry('valid', '2026-10-18T16:00:00.000Z');
    storage.setItem(key, JSON.stringify([
      null, false, {}, { ...valid, id: '' }, { ...valid, date: 'yesterday' },
      { ...valid, mood: 6 }, { ...valid, mood: '3' }, { ...valid, note: null },
      { ...valid, mood: 1.5 }, { ...valid, note: 'x'.repeat(501) },
      { ...valid, unexpected: 'ignore' }, valid,
    ]));
    expect(loadCheckIns()).toEqual([valid]);
  });

  it('sorts previously stored unsorted check-ins using actual timestamps', () => {
    const old = entry('old', '2026-10-12T10:00:00.000Z');
    const recent = entry('recent', '2026-10-18T12:00:00+05:30');
    storage.setItem(key, JSON.stringify([old, recent]));
    expect(loadCheckIns()).toEqual([recent, old]);
  });

  it('rejects an out-of-range runtime mood before writing', () => {
    expect(() => addCheckIn({ mood: 7 as Mood, note: '' })).toThrow('Choose a valid mood');
    expect(storage.getItem(key)).toBeNull();
  });

  it('deletes one entry and clears only this project storage key', () => {
    const first = addCheckIn({ mood: 1, note: '' });
    const second = addCheckIn({ mood: 2, note: '' });
    storage.setItem('unrelated', 'keep');
    deleteCheckIn(first.id);
    expect(loadCheckIns()).toEqual([second]);
    deleteCheckIn('missing');
    expect(loadCheckIns()).toEqual([second]);
    clearCheckIns();
    expect(storage.getItem(key)).toBeNull();
    expect(storage.getItem('unrelated')).toBe('keep');
  });

  it('returns an empty list when storage cannot be read', () => {
    vi.spyOn(storage, 'getItem').mockImplementation(() => { throw new Error('Blocked'); });
    expect(loadCheckIns()).toEqual([]);
  });

  it('does not overwrite existing data when reading is blocked but writing is allowed', () => {
    const existing = addCheckIn({ mood: 3, note: 'Keep me' });
    const read = vi.spyOn(storage, 'getItem').mockImplementation(() => { throw new Error('Blocked'); });
    expect(() => addCheckIn({ mood: 4, note: '' })).toThrow(CheckInStorageError);
    expect(() => deleteCheckIn(existing.id)).toThrow(CheckInStorageError);
    read.mockRestore();
    expect(loadCheckIns()).toEqual([existing]);
  });

  it('does not claim a successful save or deletion when writing fails', () => {
    const existing = addCheckIn({ mood: 3, note: 'Keep me' });
    vi.spyOn(storage, 'setItem').mockImplementation(() => { throw new Error('Quota exceeded'); });
    expect(() => addCheckIn({ mood: 4, note: '' })).toThrow(CheckInStorageError);
    expect(() => deleteCheckIn(existing.id)).toThrow(CheckInStorageError);
    expect(loadCheckIns()).toEqual([existing]);
  });

  it('keeps existing entries if clearing fails', () => {
    const existing = addCheckIn({ mood: 3, note: '' });
    vi.spyOn(storage, 'removeItem').mockImplementation(() => { throw new Error('Blocked'); });
    expect(() => clearCheckIns()).toThrow(CheckInStorageError);
    expect(loadCheckIns()).toEqual([existing]);
  });

  it('notifies same-tab subscribers only after a successful write', () => {
    const events: string[] = [];
    vi.stubGlobal('window', { dispatchEvent: (event: Event) => { events.push(event.type); return true; } });
    const item = addCheckIn({ mood: 3, note: '' });
    deleteCheckIn(item.id);
    clearCheckIns();
    expect(events).toEqual(Array(3).fill('mhc:checkins-changed'));
    vi.spyOn(storage, 'setItem').mockImplementation(() => { throw new Error('Blocked'); });
    expect(() => addCheckIn({ mood: 3, note: '' })).toThrow(CheckInStorageError);
    expect(events).toHaveLength(3);
  });
});

describe('last seven days summary', () => {
  it('excludes old and future entries, includes the boundary, and rounds the mood label', () => {
    const checkIns = [
      entry('boundary', '2026-10-11T16:00:00.000Z', 3),
      entry('now', '2026-10-18T16:00:00.000Z', 4),
      entry('old', '2026-10-11T15:59:59.999Z', 1),
      entry('future', '2026-10-18T16:00:00.001Z', 5),
    ];
    expect(getWeeklySummary(checkIns)).toEqual({ count: 2, average: 3.5, label: 'Good' });
  });
  it('returns no average when no entries qualify', () => {
    expect(getWeeklySummary([])).toEqual({ count: 0, average: null, label: null });
  });
});

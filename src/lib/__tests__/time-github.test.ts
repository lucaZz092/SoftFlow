import { describe, expect, it } from 'vitest';
import { entryMinutes, findRunningEntry, formatClock, formatDuration, parseDurationInput, taskMinutes } from '../time';
import { parseGithubLink } from '../githubLinks';
import { makeTask } from './fixtures';

describe('time tracking', () => {
  it('measures finished and running entries', () => {
    const now = new Date('2026-01-01T12:30:00Z').getTime();
    expect(entryMinutes({ id: 'a', start: '2026-01-01T10:00:00Z', end: '2026-01-01T11:15:00Z' })).toBe(75);
    expect(entryMinutes({ id: 'b', start: '2026-01-01T12:00:00Z', end: null }, now)).toBe(30);
    const task = makeTask({
      timeEntries: [
        { id: 'a', start: '2026-01-01T10:00:00Z', end: '2026-01-01T11:15:00Z' },
        { id: 'b', start: '2026-01-01T12:00:00Z', end: null },
      ],
    });
    expect(taskMinutes(task, now)).toBe(105);
    expect(findRunningEntry([makeTask(), task])?.entry.id).toBe('b');
  });

  it('formats durations', () => {
    expect(formatDuration(95)).toBe('1h 35min');
    expect(formatDuration(120)).toBe('2h');
    expect(formatDuration(30)).toBe('30min');
    expect(formatClock(61.5)).toBe('01:01:30');
  });

  it('parses manual duration input', () => {
    expect(parseDurationInput('1:30')).toBe(90);
    expect(parseDurationInput('1,5')).toBe(90);
    expect(parseDurationInput('2h')).toBe(120);
    expect(parseDurationInput('45m')).toBe(45);
    expect(parseDurationInput('abc')).toBeNull();
    expect(parseDurationInput('1:75')).toBeNull();
  });
});

describe('github links', () => {
  it('parses PR and issue URLs', () => {
    expect(parseGithubLink('https://github.com/acme/web/pull/42/files')).toEqual({
      owner: 'acme',
      repo: 'web',
      kind: 'pull',
      number: 42,
      url: 'https://github.com/acme/web/pull/42',
    });
    expect(parseGithubLink('github.com/acme/web/issues/7')?.kind).toBe('issue');
    expect(parseGithubLink('https://gitlab.com/acme/web/pull/1')).toBeNull();
  });
});

import { addDays, addWeeks, endOfMonth, parse, isValid, format } from 'date-fns';
import { cs } from 'date-fns/locale';

const CZECH_MONTHS: Record<string, number> = {
  ledna: 0,
  unora: 1,
  února: 1,
  brezna: 2,
  března: 2,
  dubna: 3,
  kvetna: 4,
  května: 4,
  cervna: 5,
  června: 5,
  cervence: 6,
  července: 6,
  srpna: 7,
  zari: 8,
  září: 8,
  rijna: 9,
  října: 9,
  listopadu: 10,
  prosince: 11,
};

/**
 * Parses Czech date strings into ISO date strings (YYYY-MM-DD).
 *
 * Handles:
 * - ISO passthrough: '2026-01-31' -> '2026-01-31'
 * - Czech D.M.YYYY format: '31.1.2026' -> '2026-01-31'
 * - Czech D.M. short format: '31.1.' -> current year assumed
 * - Relative: 'za N dni/dnu/dny' -> N days from today
 * - Relative: 'za N tyden/tydny/tydnu/tydnech/tyden' -> N weeks from today
 * - Month end: 'konec [month]' -> last day of that month in current or next year
 * - Returns null for unrecognized input or undefined
 */
export function parseCzechDate(input: string | undefined): string | null {
  if (!input) return null;

  const trimmed = input.trim();
  if (!trimmed) return null;

  // ISO passthrough: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Czech D.M.YYYY format: '31.1.2026' or '31.01.2026'
  const dmyMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const year = parseInt(dmyMatch[3], 10);
    const date = new Date(year, month - 1, day);
    if (isValid(date) && date.getDate() === day && date.getMonth() === month - 1) {
      return format(date, 'yyyy-MM-dd');
    }
    return null;
  }

  // Czech D.M. short format: '31.1.' (no year)
  const dmMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.$$/);
  if (dmMatch) {
    const day = parseInt(dmMatch[1], 10);
    const month = parseInt(dmMatch[2], 10);
    let year = today.getFullYear();
    let date = new Date(year, month - 1, day);
    // If date is in the past, try next year
    if (date < today) {
      year += 1;
      date = new Date(year, month - 1, day);
    }
    if (isValid(date) && date.getDate() === day && date.getMonth() === month - 1) {
      return format(date, 'yyyy-MM-dd');
    }
    return null;
  }

  const lower = trimmed.toLowerCase();

  // Relative: 'za N dni/dnu/dny/dnem'
  const dniMatch = lower.match(/^za\s+(\d+)\s+dn[íiuy]?$/);
  if (dniMatch) {
    const n = parseInt(dniMatch[1], 10);
    return format(addDays(today, n), 'yyyy-MM-dd');
  }

  // Relative: 'za N tyden/tydny/tydnu/tydnech' (also handles 'týden', 'týdny')
  const tydnyMatch = lower.match(/^za\s+(\d+)\s+t[yý]dn[eyu]?[nch]*$/);
  if (tydnyMatch) {
    const n = parseInt(tydnyMatch[1], 10);
    return format(addWeeks(today, n), 'yyyy-MM-dd');
  }

  // Month end: 'konec [month]'
  const konecMatch = lower.match(/^konec\s+(\S+)$/);
  if (konecMatch) {
    const monthKey = konecMatch[1]
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    const monthIndex = CZECH_MONTHS[monthKey];
    if (monthIndex !== undefined) {
      let year = today.getFullYear();
      let date = endOfMonth(new Date(year, monthIndex, 1));
      // If that end-of-month is in the past, use next year
      if (date < today) {
        year += 1;
        date = endOfMonth(new Date(year, monthIndex, 1));
      }
      return format(date, 'yyyy-MM-dd');
    }
  }

  return null;
}

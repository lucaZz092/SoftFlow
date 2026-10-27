/** YYYY-MM-DD in the local timezone, offset by whole days from today. */
export const localDate = (offsetDays = 0, from = new Date()) => {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + offsetDays);
  return toIsoDate(d);
};

export const toIsoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Parses YYYY-MM-DD as a local date (new Date('YYYY-MM-DD') would be UTC midnight). */
export const parseIsoDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (iso: string, days: number) => {
  const d = parseIsoDate(iso);
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
};

/** Adds calendar months, clamping to the last day (Jan 31 + 1 month = Feb 28/29). */
export const addMonths = (iso: string, months: number) => {
  const d = parseIsoDate(iso);
  const day = d.getDate();
  const target = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, lastDay));
  return toIsoDate(target);
};

export const formatDateBR = (iso?: string | null) => {
  if (!iso) return '—';
  return parseIsoDate(iso.slice(0, 10)).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export function sanitizeString(input: unknown, maxLen = 500): string {
  if (typeof input !== 'string') return '';
  const trimmed = input.trim().replace(/[\u0000-\u001F\u007F]/g, '');
  return trimmed.slice(0, maxLen);
}

export function sanitizeNumber(input: unknown, fallback = 0): number {
  const n = Number(input);
  return Number.isFinite(n) ? n : fallback;
}

export function sanitizeArrayNumbers(input: unknown, allowed: number[] = [1,2,3,4]) {
  if (!Array.isArray(input)) return [] as number[];
  return input
    .map((v) => Number(v))
    .filter((v) => allowed.includes(v));
}

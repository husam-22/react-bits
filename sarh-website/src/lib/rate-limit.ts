import 'server-only';

/**
 * A small fixed-window rate limiter kept in memory.
 *
 * It protects a single long-running Node server. On serverless hosting every instance has its own memory, so
 * replace this with a shared store (for example a hosted Redis/KV) or the platform's own rate limiting before
 * relying on it there. See docs/MISSING-DATA.md.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_KEYS = 5000;

const hits = new Map<string, { count: number; resetAt: number }>();

export function allowRequest(key: string, now = Date.now()): boolean {
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    if (hits.size >= MAX_KEYS) {
      for (const [stored, value] of hits) if (value.resetAt <= now) hits.delete(stored);
      if (hits.size >= MAX_KEYS) hits.clear();
    }
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_REQUESTS;
}

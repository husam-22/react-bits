import { NextResponse, type NextRequest } from 'next/server';
import { deliver, isContactConnected } from '@/lib/contact-delivery';
import { validateContact, type ContactInput } from '@/lib/contact-schema';
import { allowRequest } from '@/lib/rate-limit';

/**
 * Receives a consultation request.
 *
 * JSON requests (the normal case) get a JSON answer. A plain HTML form post (JavaScript unavailable) is
 * answered with a redirect back to /contact carrying only a status word. Nothing is stored by this site and
 * the content of a request is never written to the logs. "ok" is returned only after the receiving service
 * has accepted the request.
 */

export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 16 * 1024;
/** A person needs at least a few seconds to fill the form. */
const MIN_FILL_MS = 2500;

type Code = 'ok' | 'invalid' | 'spam' | 'rate_limited' | 'not_connected' | 'delivery_failed' | 'bad_request';

const STATUS: Record<Code, number> = {
  ok: 200,
  invalid: 422,
  spam: 400,
  rate_limited: 429,
  // An expected state of the preview, not a server fault: answered with 200 and `ok: false`, so trying the
  // form in preview does not leave a network error in the visitor's console. The body still says "not sent".
  not_connected: 200,
  delivery_failed: 502,
  bad_request: 400
};

/** Status word used in the redirect of a no-JavaScript submission. */
const WORD: Record<Code, string> = {
  ok: 'sent',
  invalid: 'invalid',
  spam: 'invalid',
  rate_limited: 'rate',
  not_connected: 'not-connected',
  delivery_failed: 'failed',
  bad_request: 'invalid'
};

async function readBody(request: NextRequest): Promise<{ fields: Record<string, unknown>; json: boolean } | null> {
  const length = Number(request.headers.get('content-length') ?? '0');
  if (length > MAX_BODY_BYTES) return null;
  const type = request.headers.get('content-type') ?? '';
  try {
    if (type.includes('application/json')) {
      const raw = await request.text();
      if (raw.length > MAX_BODY_BYTES) return null;
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
      return { fields: parsed as Record<string, unknown>, json: true };
    }
    if (type.includes('application/x-www-form-urlencoded') || type.includes('multipart/form-data')) {
      const data = await request.formData();
      const fields: Record<string, unknown> = {};
      for (const [key, value] of data) if (typeof value === 'string') fields[key] = value;
      return { fields, json: false };
    }
  } catch {
    return null;
  }
  return null;
}

async function handle(request: NextRequest): Promise<{ code: Code; json: boolean; errors?: Record<string, string> }> {
  const body = await readBody(request);
  if (!body) return { code: 'bad_request', json: true };
  const { fields, json } = body;

  // Honeypot: a field people never see. Timing: forms filled faster than a person can type.
  const startedAt = Number(fields.startedAt);
  if (typeof fields.company === 'string' && fields.company.trim() !== '') return { code: 'spam', json };
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FILL_MS) return { code: 'spam', json };

  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (!allowRequest(forwarded || request.headers.get('x-real-ip') || 'unknown')) return { code: 'rate_limited', json };

  const result = validateContact(fields as ContactInput);
  if (!result.ok) return { code: 'invalid', json, errors: result.errors };

  if (!isContactConnected()) return { code: 'not_connected', json };

  const outcome = await deliver(result.data);
  return { code: outcome === 'delivered' ? 'ok' : outcome === 'not-connected' ? 'not_connected' : 'delivery_failed', json };
}

export async function POST(request: NextRequest) {
  const { code, json, errors } = await handle(request);
  if (!json) {
    // A relative Location keeps the visitor on whatever host and proxy they came through.
    return new NextResponse(null, { status: 303, headers: { Location: `/contact?status=${WORD[code]}#contact-form` } });
  }
  return NextResponse.json(
    { ok: code === 'ok', code, ...(errors ? { errors } : {}) },
    { status: STATUS[code], headers: { 'Cache-Control': 'no-store' } }
  );
}

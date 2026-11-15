import 'server-only';
import { describeContact, type ContactData } from './contact-schema';

/**
 * Delivery of consultation requests. Server only: the settings below never reach the browser.
 *
 * Two ways to connect the form (set one in the hosting environment, see .env.example):
 *  1. CONTACT_WEBHOOK_URL (+ optional CONTACT_WEBHOOK_SECRET): the request is POSTed as JSON to that address
 *     (a CRM, an automation tool, a spreadsheet script…).
 *  2. RESEND_API_KEY + CONTACT_TO_EMAIL + CONTACT_FROM_EMAIL: the request is e-mailed through Resend's HTTP API.
 *
 * With neither configured the form is "not connected": nothing is sent, nothing is stored, and the visitor is
 * told so. A request counts as delivered only when the receiving service answers with a success status.
 */

const env = (name: string) => process.env[name]?.trim() || null;

export type DeliveryChannel = 'webhook' | 'email' | null;

export function deliveryChannel(): DeliveryChannel {
  if (env('CONTACT_WEBHOOK_URL')) return 'webhook';
  if (env('RESEND_API_KEY') && env('CONTACT_TO_EMAIL') && env('CONTACT_FROM_EMAIL')) return 'email';
  return null;
}

export const isContactConnected = () => deliveryChannel() !== null;

const TIMEOUT_MS = 10_000;

export async function deliver(data: ContactData): Promise<'delivered' | 'failed' | 'not-connected'> {
  const channel = deliveryChannel();
  if (!channel) return 'not-connected';

  const lines = describeContact(data);
  try {
    if (channel === 'webhook') {
      const secret = env('CONTACT_WEBHOOK_SECRET');
      const response = await fetch(env('CONTACT_WEBHOOK_URL') as string, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(secret ? { Authorization: `Bearer ${secret}` } : {}) },
        body: JSON.stringify({ source: 'sarh-website', receivedAt: new Date().toISOString(), ...data, summary: lines.join('\n') }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
        cache: 'no-store'
      });
      return response.ok ? 'delivered' : 'failed';
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env('RESEND_API_KEY')}` },
      body: JSON.stringify({
        from: env('CONTACT_FROM_EMAIL'),
        to: [env('CONTACT_TO_EMAIL')],
        subject: `طلب جديد من الموقع — ${data.name}`,
        text: lines.join('\n')
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store'
    });
    return response.ok ? 'delivered' : 'failed';
  } catch {
    // The request content is deliberately not logged.
    return 'failed';
  }
}

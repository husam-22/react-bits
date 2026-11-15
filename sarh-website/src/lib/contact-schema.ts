import { form, propertyOptions, requestOptions, serviceOptions, type PropertyValue, type RequestValue } from '@/content/contact';
import type { ServiceValue } from '@/content/services';

/**
 * Validation of a consultation request. The same function runs in the browser (for immediate, field-level
 * messages) and on the server (the browser is never trusted).
 */

export interface ContactInput {
  request?: unknown;
  name?: unknown;
  phone?: unknown;
  service?: unknown;
  property?: unknown;
  area?: unknown;
  areaUnknown?: unknown;
  city?: unknown;
  details?: unknown;
  consent?: unknown;
}

export interface ContactData {
  request: RequestValue;
  name: string;
  phone: string;
  service: ServiceValue;
  property: PropertyValue | null;
  /** Square metres, or `null` when left empty or marked as not known yet. */
  area: number | null;
  areaUnknown: boolean;
  city: string;
  details: string;
  consent: true;
}

export type ContactField = 'name' | 'phone' | 'service' | 'area' | 'city' | 'details' | 'consent';
export type ContactErrors = Partial<Record<ContactField, string>>;

export const LIMITS = { name: 80, phone: 24, city: 120, details: 2000, area: 10_000_000 } as const;

/** Arabic-Indic and Persian digits → Latin digits, so numbers typed on an Arabic keyboard are accepted. */
export const toLatinDigits = (value: string) =>
  value.replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 0x06f0));

const text = (value: unknown, max: number) =>
  typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max + 1) : '';

const truthy = (value: unknown) => value === true || value === 'true' || value === 'on' || value === '1';

export function validateContact(input: ContactInput): { ok: true; data: ContactData } | { ok: false; errors: ContactErrors } {
  const errors: ContactErrors = {};

  const name = text(input.name, LIMITS.name);
  if (!name) errors.name = form.errors.nameRequired;
  else if (name.length < 3 || name.length > LIMITS.name) errors.name = form.errors.nameShort;

  const phone = toLatinDigits(text(input.phone, LIMITS.phone));
  const digits = phone.replace(/\D/g, '');
  if (!phone) errors.phone = form.errors.phoneRequired;
  else if (!/^\+?[\d\s().-]+$/.test(phone) || digits.length < 7 || digits.length > 15) errors.phone = form.errors.phoneInvalid;

  const service = serviceOptions.find(option => option.value === input.service)?.value;
  if (!service) errors.service = form.errors.serviceRequired;

  const city = text(input.city, LIMITS.city);
  if (city.length < 2 || city.length > LIMITS.city) errors.city = form.errors.cityRequired;

  const areaUnknown = truthy(input.areaUnknown);
  const areaText = toLatinDigits(typeof input.area === 'number' ? String(input.area) : text(input.area, 16)).replace(/[٫,]/g, '.');
  let area: number | null = null;
  if (!areaUnknown && areaText) {
    const parsed = Number(areaText);
    if (!/^\d+(\.\d+)?$/.test(areaText) || !Number.isFinite(parsed) || parsed <= 0 || parsed > LIMITS.area) {
      errors.area = form.errors.areaInvalid;
    } else {
      area = parsed;
    }
  }

  const details = typeof input.details === 'string' ? input.details.trim() : '';
  if (details.length > LIMITS.details) errors.details = form.errors.detailsLong;

  if (!truthy(input.consent)) errors.consent = form.errors.consentRequired;

  if (Object.keys(errors).length || !service) return { ok: false, errors };

  return {
    ok: true,
    data: {
      request: requestOptions.find(option => option.value === input.request)?.value ?? 'consultation',
      name,
      phone,
      service,
      property: propertyOptions.find(option => option.value === input.property)?.value ?? null,
      area,
      areaUnknown,
      city,
      details,
      consent: true
    }
  };
}

const labelOf = <T extends string>(options: { value: T; label: string }[], value: T | null) =>
  options.find(option => option.value === value)?.label ?? '';

/** The request as readable Arabic lines: used for the e-mail body and for the WhatsApp draft. */
export function describeContact(data: ContactData): string[] {
  const lines = [
    `${form.fields.request.label}: ${labelOf(requestOptions, data.request)}`,
    `${form.fields.name.label}: ${data.name}`,
    `${form.fields.phone.label}: ${data.phone}`,
    `${form.fields.service.label}: ${labelOf(serviceOptions, data.service)}`
  ];
  if (data.property) lines.push(`${form.fields.property.label}: ${labelOf(propertyOptions, data.property)}`);
  if (data.area) lines.push(`${form.fields.area.label}: ${data.area} ${form.fields.area.unit}`);
  else if (data.areaUnknown) lines.push(`${form.fields.area.label}: ${form.fields.area.unknown}`);
  lines.push(`${form.fields.city.label}: ${data.city}`);
  if (data.details) lines.push(`${form.fields.details.label}: ${data.details}`);
  return lines;
}

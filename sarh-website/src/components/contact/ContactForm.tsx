'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';
import Notice from '@/components/ui/Notice';
import { AlertIcon, CheckIcon } from '@/components/ui/icons';
import { form, propertyOptions, requestOptions, serviceOptions, type RequestValue } from '@/content/contact';
import type { ServiceValue } from '@/content/services';
import { whatsappHref } from '@/content/site';
import { cn } from '@/lib/cn';
import { LIMITS, describeContact, validateContact, type ContactErrors, type ContactField } from '@/lib/contact-schema';

/** Outcome of a submission that happened without JavaScript (the server redirects back with ?status=…). */
export type ReturnStatus = 'sent' | 'invalid' | 'rate' | 'not-connected' | 'failed';

interface ContactFormProps {
  /** Whether a receiving service is configured on the server. Decided on the server, no secret is exposed. */
  connected: boolean;
  /** Show the "not connected" explanation above the form (preview mode). */
  showConnectionNotice: boolean;
  initialService?: ServiceValue;
  initialRequest?: RequestValue;
  returnStatus?: ReturnStatus;
  /** Read ?service= and ?request= in the browser. Used where the page itself is static (home page). */
  readQuery?: boolean;
}

type Phase =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'sent' }
  | { kind: 'problem'; message: string };

const FIELD_ORDER: ContactField[] = ['name', 'phone', 'service', 'area', 'city', 'details', 'consent'];

const inputClass =
  'block min-h-12 w-full rounded-[3px] border border-line bg-white/70 px-4 py-2.5 text-ink transition-colors placeholder:text-ink-soft hover:border-forest/40 focus:border-forest focus:bg-white focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-deep aria-[invalid=true]:border-danger';

const isService = (value: string | null): value is ServiceValue => serviceOptions.some(option => option.value === value);
const isRequest = (value: string | null): value is RequestValue => requestOptions.some(option => option.value === value);

const RETURN_MESSAGES: Record<Exclude<ReturnStatus, 'sent'>, string> = {
  invalid: form.errors.summary,
  rate: form.errors.rateLimited,
  'not-connected': form.notConnected.onSubmit,
  failed: form.errors.delivery
};

function Field({
  id,
  label,
  required,
  hint,
  error,
  className,
  children
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block font-medium text-forest">
        {label}
        {required ? (
          <span className="text-danger" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink-soft">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-danger">
          <AlertIcon className="mt-0.5 size-4 flex-none" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function ContactForm({
  connected,
  showConnectionNotice,
  initialService,
  initialRequest,
  returnStatus,
  readQuery = false
}: ContactFormProps) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef<HTMLInputElement>(null);
  /** Set synchronously, so two clicks in the same instant cannot both start a request. */
  const sending = useRef(false);

  const [hydrated, setHydrated] = useState(false);
  const [request, setRequest] = useState<RequestValue>(initialRequest ?? 'consultation');
  const [service, setService] = useState<ServiceValue | ''>(initialService ?? '');
  const [areaUnknown, setAreaUnknown] = useState(false);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [phase, setPhase] = useState<Phase>(() =>
    returnStatus === 'sent'
      ? { kind: 'sent' }
      : returnStatus
        ? { kind: 'problem', message: RETURN_MESSAGES[returnStatus] }
        : { kind: 'idle' }
  );

  useEffect(() => {
    // After hydration: custom Arabic validation replaces the browser's, and the fill timer starts now.
    const timer = window.setTimeout(() => {
      setHydrated(true);
      if (startedAt.current) startedAt.current.value = String(Date.now());
      if (!readQuery) return;
      const query = new URLSearchParams(window.location.search);
      const wantedService = query.get('service');
      const wantedRequest = query.get('request');
      if (isService(wantedService)) setService(wantedService);
      if (isRequest(wantedRequest)) setRequest(wantedRequest);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [readQuery]);

  const read = () => {
    const data = new FormData(formRef.current ?? undefined);
    const value = (name: string) => String(data.get(name) ?? '');
    return {
      request,
      name: value('name'),
      phone: value('phone'),
      service,
      property: value('property'),
      area: value('area'),
      areaUnknown,
      city: value('city'),
      details: value('details'),
      consent: data.get('consent') === 'on',
      company: value('company'),
      startedAt: Number(value('startedAt'))
    };
  };

  const focusFirstError = (found: ContactErrors) => {
    const first = FIELD_ORDER.find(field => found[field]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  const showProblem = (message: string) => {
    setPhase({ kind: 'problem', message });
    window.requestAnimationFrame(() => statusRef.current?.focus());
  };

  /** Clears a field's message as soon as the visitor edits it. */
  const clear = (field: ContactField) => {
    if (errors[field]) setErrors(current => ({ ...current, [field]: undefined }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending.current) return;

    const payload = read();
    const checked = validateContact(payload);
    if (!checked.ok) {
      setErrors(checked.errors);
      setPhase({ kind: 'problem', message: form.errors.summary });
      focusFirstError(checked.errors);
      return;
    }

    sending.current = true;
    setErrors({});
    setPhase({ kind: 'submitting' });
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = (await response.json().catch(() => null)) as { ok?: boolean; code?: string; errors?: ContactErrors } | null;

      // Success is shown only when the server confirms that the receiving service accepted the request.
      if (response.ok && result?.ok === true) {
        setPhase({ kind: 'sent' });
        window.requestAnimationFrame(() => statusRef.current?.focus());
        return;
      }
      if (result?.code === 'invalid' && result.errors) {
        setErrors(result.errors);
        setPhase({ kind: 'problem', message: form.errors.summary });
        focusFirstError(result.errors);
        return;
      }
      const messages: Record<string, string> = {
        not_connected: form.notConnected.onSubmit,
        rate_limited: form.errors.rateLimited,
        spam: form.errors.tooFast,
        delivery_failed: form.errors.delivery
      };
      showProblem(messages[result?.code ?? ''] ?? form.errors.delivery);
    } catch {
      showProblem(form.errors.network);
    } finally {
      sending.current = false;
    }
  };

  /** Opens WhatsApp with the request drafted. The visitor still has to press "send" there. */
  const onWhatsapp = () => {
    const checked = validateContact(read());
    if (!checked.ok) {
      setErrors(checked.errors);
      setPhase({ kind: 'problem', message: form.errors.summary });
      focusFirstError(checked.errors);
      return;
    }
    const href = whatsappHref(describeContact(checked.data).join('\n'));
    if (href) window.open(href, '_blank', 'noopener,noreferrer');
  };

  const reset = () => {
    formRef.current?.reset();
    setErrors({});
    setAreaUnknown(false);
    setService(initialService ?? '');
    setRequest(initialRequest ?? 'consultation');
    setPhase({ kind: 'idle' });
    if (startedAt.current) startedAt.current.value = String(Date.now());
  };

  const describedBy = (name: ContactField, hasHint = false) =>
    errors[name] ? id(`${name}-error`) : hasHint ? id(`${name}-hint`) : undefined;

  const submitting = phase.kind === 'submitting';
  const whatsappAvailable = whatsappHref() !== null;

  if (phase.kind === 'sent') {
    return (
      <div id="contact-form" ref={statusRef} tabIndex={-1} role="status" className="swap-in border-t-2 border-brass py-10 outline-none">
        <CheckIcon className="size-9 text-brass-deep" />
        <h3 className="mt-5 text-[1.75rem] font-semibold">{form.success.title}</h3>
        <p className="lead mt-3">{form.success.text}</p>
        {returnStatus === 'sent' ? (
          // Reached through a plain form post (no JavaScript): a real link starts a fresh form.
          <ButtonLink href="/contact#contact-form" variant="outline" className="mt-8">
            {form.success.again}
          </ButtonLink>
        ) : (
          <Button variant="outline" className="mt-8" onClick={reset}>
            {form.success.again}
          </Button>
        )}
      </div>
    );
  }

  return (
    <form
      id="contact-form"
      ref={formRef}
      method="post"
      action="/api/contact"
      // Browsers validate natively until JavaScript takes over with field-level Arabic messages.
      noValidate={hydrated}
      onSubmit={onSubmit}
      aria-label={form.title}
      className="grid gap-x-6 gap-y-6 sm:grid-cols-2"
    >
      {!connected && showConnectionNotice ? (
        <Notice title={form.notConnected.title} className="sm:col-span-2">
          {form.notConnected.text}
        </Notice>
      ) : null}

      <div
        ref={statusRef}
        tabIndex={-1}
        role="alert"
        className={cn(
          'outline-none sm:col-span-2',
          phase.kind === 'problem'
            ? 'flex items-start gap-3 rounded-[3px] border border-danger/40 bg-danger/5 px-4 py-3.5 font-medium text-danger'
            : 'hidden'
        )}
      >
        {phase.kind === 'problem' ? (
          <>
            <AlertIcon className="mt-1 size-5 flex-none" />
            <p>{phase.message}</p>
          </>
        ) : null}
      </div>

      <fieldset className="sm:col-span-2">
        <legend className="mb-2 font-medium text-forest">{form.fields.request.label}</legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {requestOptions.map(option => (
            <label
              key={option.value}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-[3px] border border-line bg-white/70 px-4 py-2.5 transition-colors hover:border-forest/40 has-[:checked]:border-forest has-[:checked]:bg-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brass-deep"
            >
              <input
                type="radio"
                name="request"
                value={option.value}
                checked={request === option.value}
                onChange={() => setRequest(option.value)}
                className="size-[1.125rem] flex-none accent-forest outline-none"
              />
              {option.label}
            </label>
          ))}
        </div>
        {request === 'site-visit' ? <p className="mt-2 text-sm text-ink-soft">{form.visitNote}</p> : null}
      </fieldset>

      <Field id={id('name')} label={form.fields.name.label} required error={errors.name}>
        <input
          id={id('name')}
          name="name"
          type="text"
          autoComplete="name"
          required
          maxLength={LIMITS.name}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={describedBy('name')}
          onChange={() => clear('name')}
          className={inputClass}
        />
      </Field>

      <Field id={id('phone')} label={form.fields.phone.label} required hint={form.fields.phone.hint} error={errors.phone}>
        <input
          id={id('phone')}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          dir="ltr"
          required
          maxLength={LIMITS.phone}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={describedBy('phone', true)}
          onChange={() => clear('phone')}
          className={cn(inputClass, 'text-end')}
        />
      </Field>

      <Field id={id('service')} label={form.fields.service.label} required error={errors.service}>
        <select
          id={id('service')}
          name="service"
          required
          value={service}
          onChange={event => {
            setService(event.target.value as ServiceValue | '');
            clear('service');
          }}
          aria-invalid={Boolean(errors.service)}
          aria-describedby={describedBy('service')}
          className={inputClass}
        >
          <option value="">{form.fields.service.placeholder}</option>
          {serviceOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <Field id={id('property')} label={form.fields.property.label}>
        <select id={id('property')} name="property" defaultValue="" className={inputClass}>
          <option value="">{form.fields.property.placeholder}</option>
          {propertyOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <Field id={id('area')} label={form.fields.area.label} error={errors.area}>
        <div className="relative">
          <input
            id={id('area')}
            name="area"
            type="text"
            inputMode="decimal"
            dir="ltr"
            disabled={areaUnknown}
            aria-invalid={Boolean(errors.area)}
            aria-describedby={describedBy('area')}
            onChange={() => clear('area')}
            className={cn(inputClass, 'pe-4 ps-14 text-end disabled:cursor-not-allowed disabled:bg-ivory-deep/60 disabled:text-ink-soft')}
          />
          <span className="pointer-events-none absolute inset-y-0 start-4 flex items-center text-ink-soft" aria-hidden="true">
            {form.fields.area.unit}
          </span>
        </div>
        <label className="mt-2 flex min-h-11 cursor-pointer items-center gap-3 text-[0.9375rem] text-ink-soft">
          <input
            type="checkbox"
            name="areaUnknown"
            checked={areaUnknown}
            onChange={event => {
              setAreaUnknown(event.target.checked);
              clear('area');
            }}
            className="size-[1.125rem] flex-none accent-forest"
          />
          {form.fields.area.unknown}
        </label>
      </Field>

      <Field id={id('city')} label={form.fields.city.label} required error={errors.city}>
        <input
          id={id('city')}
          name="city"
          type="text"
          autoComplete="address-level2"
          required
          maxLength={LIMITS.city}
          aria-invalid={Boolean(errors.city)}
          aria-describedby={describedBy('city')}
          onChange={() => clear('city')}
          className={inputClass}
        />
      </Field>

      <Field id={id('details')} label={form.fields.details.label} error={errors.details} className="sm:col-span-2">
        <textarea
          id={id('details')}
          name="details"
          rows={4}
          maxLength={LIMITS.details}
          aria-invalid={Boolean(errors.details)}
          aria-describedby={describedBy('details')}
          onChange={() => clear('details')}
          className={cn(inputClass, 'min-h-32 resize-y leading-relaxed')}
        />
      </Field>

      {/* Honeypot: hidden from people and assistive technology; only automated senders fill it. */}
      <div aria-hidden="true" className="absolute -start-[9999px] size-px overflow-hidden">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      {/* Set after hydration. A value of 0 (no JavaScript) is accepted by the server as an old timestamp. */}
      <input ref={startedAt} type="hidden" name="startedAt" defaultValue="0" />

      <div className="sm:col-span-2">
        {/* Consent is never pre-ticked. */}
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="consent"
            required
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? id('consent-error') : undefined}
            onChange={() => clear('consent')}
            className="mt-1.5 size-[1.125rem] flex-none accent-forest"
          />
          <span>
            {form.fields.consent.before}
            <Link href="/privacy" className="font-medium text-forest underline decoration-brass underline-offset-4 hover:decoration-forest">
              {form.fields.consent.link}
            </Link>
            {form.fields.consent.after}
            <span className="text-danger" aria-hidden="true">
              {' '}
              *
            </span>
          </span>
        </label>
        {errors.consent ? (
          <p id={id('consent-error')} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-danger">
            <AlertIcon className="mt-0.5 size-4 flex-none" />
            {errors.consent}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 sm:col-span-2">
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" arrow={!submitting} disabled={submitting} aria-disabled={submitting} className="grow sm:grow-0">
            {submitting ? form.submitting : form.submit}
          </Button>
          {whatsappAvailable ? (
            <Button variant="outline" onClick={onWhatsapp} className="grow sm:grow-0">
              {form.whatsapp.button}
            </Button>
          ) : null}
        </div>
        {whatsappAvailable ? <p className="text-sm text-ink-soft">{form.whatsapp.note}</p> : null}
        <p className="text-sm text-ink-soft">{form.requiredNote}</p>
      </div>
    </form>
  );
}

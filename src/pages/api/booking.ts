/**
 * POST /api/booking — receives booking REQUESTS from the contact form.
 *
 * Runs as a Vercel serverless function (never prerendered), so the secrets
 * below stay on the server. Delivery is configurable via environment
 * variables (see .env.example):
 *   A) Resend email:  RESEND_API_KEY + BOOKING_TO_EMAIL + BOOKING_FROM_EMAIL
 *   B) Webhook:       BOOKING_WEBHOOK_URL
 *
 * A successful response means "request received" — never "booking confirmed".
 */
import type { APIRoute } from 'astro';
import { treatments, pricing, gbp } from '../../data/treatments';

export const prerender = false;

const env = (key: string): string | undefined =>
  (typeof process !== 'undefined' ? process.env[key] : undefined) || (import.meta.env as Record<string, string | undefined>)[key];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const clean = (v: unknown, max: number) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const POST: APIRoute = async ({ request }) => {
  let raw: Record<string, unknown> = {};
  try {
    const type = request.headers.get('content-type') || '';
    raw = type.includes('application/json') ? await request.json() : Object.fromEntries((await request.formData()).entries());
  } catch {
    return json({ ok: false, message: 'We could not read your request. Please try again.' }, 400);
  }

  // Honeypot — silently accept and discard automated submissions.
  if (clean(raw.company, 100)) return json({ ok: true });

  const data = {
    name: clean(raw.name, 100),
    email: clean(raw.email, 160),
    phone: clean(raw.phone, 30),
    experience: clean(raw.experience, 80),
    date: clean(raw.date, 10),
    time: clean(raw.time, 5),
    location: clean(raw.location, 160),
    notes: clean(raw.notes, 2000),
    duration: clean(raw.duration, 4),
    addon: ['yes', 'on', 'true'].includes(clean(raw.addon, 5)),
  };

  const fields: Record<string, string> = {};
  if (data.name.length < 2) fields.name = 'Please enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) fields.email = 'Please enter a valid email address.';
  if (data.phone.replace(/\D/g, '').length < 7 || !/^[+\d\s().-]+$/.test(data.phone)) fields.phone = 'Please enter a valid phone number.';
  const treatment = treatments.find((t) => t.slug === data.experience);
  const experience = data.experience === 'unsure' ? 'Recommendation requested' : treatment?.name;
  const option = treatment?.options.find((x) => String(x.minutes) === data.duration);
  if (treatment && !option) fields.duration = 'Please choose a duration.';
  if (!experience) fields.experience = 'Please choose an experience.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || isNaN(Date.parse(data.date))) fields.date = 'Please choose your preferred date.';
  else if (Date.parse(data.date) < Date.now() - 36 * 3600 * 1000) fields.date = 'Please choose today or a future date.';
  if (!/^\d{2}:\d{2}$/.test(data.time)) fields.time = 'Please choose your preferred time.';
  if (data.location.length < 2) fields.location = 'Please enter your postcode or location.';
  if (Object.keys(fields).length) return json({ ok: false, message: 'Please check the highlighted fields and try again.', fields }, 422);

  // Price is always recalculated on the server from the catalogue — never trusted from the browser.
  let estimate = '—';
  let durationText = '—';
  if (treatment && option) {
    const withAddOn = data.addon && treatment.addOn;
    durationText = `${option.minutes} minutes${withAddOn ? ` + ${treatment.addOn!.label}` : ''}`;
    const total = option.price === null || (withAddOn && treatment.addOn!.price === null) ? null : option.price + (withAddOn ? treatment.addOn!.price! : 0);
    const [hh, mm] = data.time.split(':').map(Number);
    const mins = hh * 60 + mm;
    const outOfHours = !(mins >= pricing.hours.open || mins <= pricing.hours.close);
    estimate = `${gbp(total)} excl. transport${outOfHours ? ` — OUTSIDE HOURS (${pricing.hours.label}), ${pricing.outOfHoursSurcharge}% surcharge may apply` : ''}${treatment.note ? ` — ${treatment.note}` : ''}`;
  }

  const rows: [string, string][] = [
    ['Name', data.name], ['Email', data.email], ['Phone', data.phone], ['Experience', experience!], ['Duration', durationText], ['Estimate', estimate],
    ['Preferred date', data.date], ['Preferred time', data.time], ['Location', data.location], ['Notes', data.notes || '—'],
  ];
  const text = `New booking request — awaiting confirmation\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n`;
  const html = `<h2>New booking request — awaiting confirmation</h2><table cellpadding="6">${rows.map(([k, v]) => `<tr><td><b>${k}</b></td><td>${esc(v).replace(/\n/g, '<br>')}</td></tr>`).join('')}</table>`;

  const resendKey = env('RESEND_API_KEY');
  const to = env('BOOKING_TO_EMAIL');
  const from = env('BOOKING_FROM_EMAIL');
  const webhook = env('BOOKING_WEBHOOK_URL');

  try {
    if (resendKey && to && from) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: to.split(',').map((s) => s.trim()), reply_to: data.email, subject: `Booking request — ${data.name} — ${data.date} ${data.time}`, text, html }),
      });
      if (!res.ok) throw new Error(`Resend responded ${res.status}`);
    } else if (webhook) {
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'winks-london-website', status: 'awaiting_confirmation', receivedAt: new Date().toISOString(), ...data, experienceName: experience, durationText, estimate, text }),
      });
      if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
    } else if (import.meta.env.DEV) {
      // Local development without a delivery service: log instead of sending.
      console.log('\n[booking] DEV MODE — no delivery service configured. Request logged only:\n' + text);
    } else {
      console.error('[booking] No delivery service configured. Set RESEND_* or BOOKING_WEBHOOK_URL.');
      return json({ ok: false, message: 'Online requests are temporarily unavailable. Please contact us directly.' }, 503);
    }
  } catch (err) {
    console.error('[booking] delivery failed:', err);
    return json({ ok: false, message: 'We could not send your request just now. Please try again in a moment.' }, 502);
  }

  return json({ ok: true, status: 'awaiting_confirmation' });
};

export const ALL: APIRoute = () => json({ ok: false, message: 'Method not allowed.' }, 405);

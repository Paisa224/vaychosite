import { serviceOptions } from '../frontend/src/features/leads/lead.options'
import type {
  LeadFormValues,
  ServiceType,
} from '../frontend/src/features/leads/lead.types'
import { validateLeadForm } from '../frontend/src/features/leads/lead.validation'

const MAX_BODY_BYTES = 12_000
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 5
const DUPLICATE_WINDOW_MS = 60_000

const serviceLabels = Object.fromEntries(
  serviceOptions.map(({ value, label }) => [value, label]),
) as Record<LeadService, string>

const allowedServices = new Set(serviceOptions.map(({ value }) => value))

export type LeadService = ServiceType

export interface LeadInput
  extends Omit<LeadFormValues, 'service' | 'website' | 'customService'> {
  service: LeadService
  customService?: string
}

export interface Env {
  ASSETS: Fetcher
  RESEND_API_KEY?: string
  LEAD_NOTIFICATION_TO?: string
  LEAD_NOTIFICATION_FROM?: string
}

type ValidationErrors = Record<string, string>
type ReserveResult = 'accepted' | 'rate-limited' | 'duplicate'

export interface AbuseGuard {
  reserve(clientKey: string, fingerprint: string, now: number): ReserveResult
  release(fingerprint: string): void
}

interface RateEntry {
  count: number
  expiresAt: number
}

export class MemoryAbuseGuard implements AbuseGuard {
  private readonly rates = new Map<string, RateEntry>()
  private readonly duplicates = new Map<string, number>()

  reserve(clientKey: string, fingerprint: string, now: number): ReserveResult {
    for (const [key, entry] of this.rates) {
      if (entry.expiresAt <= now) this.rates.delete(key)
    }

    for (const [key, expiresAt] of this.duplicates) {
      if (expiresAt <= now) this.duplicates.delete(key)
    }

    if (this.duplicates.has(fingerprint)) return 'duplicate'

    const rate = this.rates.get(clientKey)
    if (!rate || rate.expiresAt <= now) {
      this.rates.set(clientKey, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS })
    } else if (rate.count >= RATE_LIMIT_MAX) {
      return 'rate-limited'
    } else {
      rate.count += 1
    }

    this.duplicates.set(fingerprint, now + DUPLICATE_WINDOW_MS)
    return 'accepted'
  }

  release(fingerprint: string): void {
    this.duplicates.delete(fingerprint)
  }
}

export interface EmailNotification {
  from: string
  to: string
  subject: string
  replyTo: string
  html: string
  text: string
}

interface WorkerDependencies {
  abuseGuard?: AbuseGuard
  now?: () => Date
  sendNotification?: (
    notification: EmailNotification,
    apiKey: string,
    fetcher: typeof fetch,
  ) => Promise<void>
  fetcher?: typeof fetch
}

function json(
  body: Record<string, unknown>,
  status: number,
  headers: Record<string, string> = {},
): Response {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  })
}

function getClientKey(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}

function asTrimmedString(value: unknown): string | undefined {
  return typeof value === 'string' ? value.trim() : undefined
}

function validateLead(body: Record<string, unknown>): {
  data?: LeadInput
  errors: ValidationErrors
} {
  const name = asTrimmedString(body.name)
  const phone = asTrimmedString(body.phone)
  const email = asTrimmedString(body.email)?.toLowerCase()
  const service = asTrimmedString(body.service)
  const customService = asTrimmedString(body.customService)
  const details = asTrimmedString(body.details)
  const normalizedService =
    service && allowedServices.has(service as LeadService)
      ? (service as LeadService)
      : ''
  const errors: ValidationErrors = {
    ...validateLeadForm({
      name: name ?? '',
      phone: phone ?? '',
      email: email ?? '',
      service: normalizedService,
      customService: customService ?? '',
      details: details ?? '',
      website: '',
    }),
  }

  if (name && name.length > 120) {
    errors.name = 'Ingresa un nombre válido de entre 2 y 120 caracteres.'
  }

  if (email && email.length > 150) {
    errors.email = 'Ingresa un correo electrónico válido.'
  }

  if (service && !normalizedService) {
    errors.service = 'Selecciona un servicio válido.'
  }

  if (customService && customService.length > 120) {
    errors.customService = 'El servicio personalizado no puede superar 120 caracteres.'
  }

  if (details && details.length > 1000) {
    errors.details = 'Describe tu proyecto con entre 10 y 1.000 caracteres.'
  }

  if (Object.keys(errors).length > 0) return { errors }

  return {
    errors,
    data: {
      name: name!,
      phone: phone!,
      email: email!,
      service: normalizedService as LeadService,
      ...(customService && service === 'otro' ? { customService } : {}),
      details: details!,
    },
  }
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[character]!,
  )
}

export function buildEmailNotification(
  lead: LeadInput,
  from: string,
  to: string,
  submittedAt: Date,
): EmailNotification {
  const service = serviceLabels[lead.service]
  const selectedService =
    lead.service === 'otro' && lead.customService
      ? `${service}: ${lead.customService}`
      : service
  const date = new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Madrid',
  }).format(submittedAt)

  const rows = [
    ['Nombre', lead.name],
    ['Teléfono', lead.phone],
    ['Correo electrónico', lead.email],
    ['Servicio solicitado', selectedService],
    ['Descripción del proyecto', lead.details],
    ['Fecha y hora', `${date} (Europa/Madrid)`],
  ]

  const text = [
    'Nueva solicitud de presupuesto',
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'Este mensaje se ha enviado desde el formulario web.',
  ].join('\n')

  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:10px 14px;color:#334155;background:#f8fafc;border-bottom:1px solid #e2e8f0;">${escapeHtml(label)}</th><td style="padding:10px 14px;color:#0f172a;border-bottom:1px solid #e2e8f0;white-space:pre-wrap;">${escapeHtml(value)}</td></tr>`,
    )
    .join('')

  return {
    from,
    to,
    subject: `Nueva solicitud de presupuesto: ${selectedService}`,
    replyTo: lead.email,
    text,
    html: `<!doctype html><html lang="es"><body style="margin:0;padding:24px;background:#f1f5f9;font-family:Arial,sans-serif;"><div style="max-width:640px;margin:0 auto;overflow:hidden;border-radius:16px;background:#ffffff;border:1px solid #e2e8f0;"><div style="padding:24px;background:#172033;color:#ffffff;"><h1 style="margin:0;font-size:22px;">Nueva solicitud de presupuesto</h1><p style="margin:8px 0 0;color:#cbd5e1;">Formulario de contacto de reformasmantenimiento.es</p></div><table role="presentation" style="width:100%;border-collapse:collapse;">${htmlRows}</table><p style="margin:0;padding:18px 24px;color:#64748b;font-size:13px;">Puedes responder a este correo para contactar directamente con el cliente.</p></div></body></html>`,
  }
}

async function sendResendNotification(
  notification: EmailNotification,
  apiKey: string,
  fetcher: typeof fetch,
): Promise<void> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    const response = await fetcher('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: notification.from,
        to: [notification.to],
        reply_to: notification.replyTo,
        subject: notification.subject,
        html: notification.html,
        text: notification.text,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      console.error(`Resend rejected lead notification with status ${response.status}`)
      throw new Error('EMAIL_PROVIDER_ERROR')
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function hash(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  )
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function readJsonBody(request: Request): Promise<{
  body?: Record<string, unknown>
  error?: Response
}> {
  const contentType = request.headers.get('content-type')?.split(';')[0].trim()
  if (contentType !== 'application/json') {
    return {
      error: json({ ok: false, message: 'El contenido debe ser JSON.' }, 415),
    }
  }

  const contentLength = request.headers.get('content-length')
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return {
      error: json({ ok: false, message: 'La solicitud es demasiado grande.' }, 413),
    }
  }

  try {
    const buffer = await request.arrayBuffer()
    if (buffer.byteLength > MAX_BODY_BYTES) {
      return {
        error: json({ ok: false, message: 'La solicitud es demasiado grande.' }, 413),
      }
    }

    const parsed: unknown = JSON.parse(new TextDecoder().decode(buffer))
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('INVALID_OBJECT')
    }

    return { body: parsed as Record<string, unknown> }
  } catch {
    return {
      error: json({ ok: false, message: 'JSON inválido.' }, 400),
    }
  }
}

export function createWorker(dependencies: WorkerDependencies = {}) {
  const abuseGuard = dependencies.abuseGuard ?? new MemoryAbuseGuard()
  const now = dependencies.now ?? (() => new Date())
  const sendNotification = dependencies.sendNotification ?? sendResendNotification
  const fetcher = dependencies.fetcher ?? fetch

  return {
    async fetch(request: Request, env: Env): Promise<Response> {
      const url = new URL(request.url)
      if (url.pathname !== '/api/leads') {
        if (url.pathname.startsWith('/api/')) {
          return json({ ok: false, message: 'Ruta no encontrada.' }, 404)
        }
        return env.ASSETS.fetch(request)
      }

      if (request.method !== 'POST') {
        return json(
          { ok: false, message: 'Método no permitido.' },
          405,
          { Allow: 'POST' },
        )
      }

      const origin = request.headers.get('origin')
      if (origin && origin !== url.origin) {
        return json({ ok: false, message: 'Origen no permitido.' }, 403)
      }

      const parsedBody = await readJsonBody(request)
      if (parsedBody.error) return parsedBody.error
      const body = parsedBody.body!

      if (
        typeof body.website === 'string' &&
        body.website.trim().length > 0
      ) {
        return json(
          { ok: true, message: 'Solicitud recibida correctamente.' },
          200,
        )
      }

      const { data, errors } = validateLead(body)
      if (!data) {
        return json(
          {
            ok: false,
            message: 'Revisa los campos indicados.',
            errors,
          },
          422,
        )
      }

      const submittedAt = now()
      const fingerprintSource = [
        data.email,
        data.phone,
        data.service,
        data.customService ?? '',
        data.details,
      ].join('|')
      const [clientKey, fingerprint] = await Promise.all([
        hash(getClientKey(request)),
        hash(fingerprintSource),
      ])
      const reservation = abuseGuard.reserve(
        clientKey,
        fingerprint,
        submittedAt.getTime(),
      )

      if (reservation === 'rate-limited') {
        return json(
          {
            ok: false,
            message: 'Has enviado demasiadas solicitudes. Espera un minuto.',
          },
          429,
          { 'Retry-After': '60' },
        )
      }

      if (reservation === 'duplicate') {
        return json(
          {
            ok: false,
            message: 'Esta solicitud ya se está procesando o fue enviada hace poco.',
          },
          409,
        )
      }

      if (
        !env.RESEND_API_KEY ||
        !env.LEAD_NOTIFICATION_TO ||
        !env.LEAD_NOTIFICATION_FROM
      ) {
        abuseGuard.release(fingerprint)
        console.error('Lead email configuration is incomplete')
        return json(
          {
            ok: false,
            message: 'El servicio de notificaciones no está configurado.',
          },
          503,
        )
      }

      try {
        const notification = buildEmailNotification(
          data,
          env.LEAD_NOTIFICATION_FROM,
          env.LEAD_NOTIFICATION_TO,
          submittedAt,
        )
        await sendNotification(notification, env.RESEND_API_KEY, fetcher)
      } catch (error) {
        abuseGuard.release(fingerprint)
        if (!(error instanceof Error && error.message === 'EMAIL_PROVIDER_ERROR')) {
          console.error('Lead email provider request failed')
        }
        return json(
          {
            ok: false,
            message: 'No se pudo enviar la solicitud. Inténtalo de nuevo.',
          },
          502,
        )
      }

      return json(
        {
          ok: true,
          message: 'Solicitud aceptada para envío.',
        },
        202,
      )
    },
  }
}

export default createWorker()

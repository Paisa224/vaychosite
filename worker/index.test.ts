import { describe, expect, it, vi } from 'vitest'
import {
  MemoryAbuseGuard,
  createWorker,
  type EmailNotification,
  type Env,
} from './index'

const validLead = {
  name: 'Ana García',
  phone: '+34 600 123 123',
  email: 'ana@example.com',
  service: 'reformas-integrales',
  customService: '',
  details: 'Quiero reformar la cocina completa de mi vivienda.',
  website: '',
}

function assetBinding() {
  return {
    fetch: vi.fn(async (request: Request) =>
      new Response(`asset:${new URL(request.url).pathname}`, {
        headers: { 'Content-Type': 'text/plain' },
      }),
    ),
  }
}

function environment(overrides: Partial<Env> = {}): Env {
  return {
    ASSETS: assetBinding() as unknown as Fetcher,
    RESEND_API_KEY: 'test-api-key',
    LEAD_NOTIFICATION_TO: 'responsable@example.com',
    LEAD_NOTIFICATION_FROM: 'Vaycho <avisos@reformasmantenimiento.es>',
    ...overrides,
  }
}

function post(
  handler: ReturnType<typeof createWorker>,
  env: Env,
  body: unknown,
  ip = '203.0.113.10',
) {
  return handler.fetch(
    new Request('https://reformasmantenimiento.es/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Connecting-IP': ip,
        Origin: 'https://reformasmantenimiento.es',
      },
      body: JSON.stringify(body),
    }),
    env,
  )
}

function acceptedSender() {
  return vi.fn(async (_notification: EmailNotification) => undefined)
}

describe('lead capture Worker', () => {
  it('acepta un envío válido y construye la notificación', async () => {
    const sendNotification = acceptedSender()
    const worker = createWorker({
      abuseGuard: new MemoryAbuseGuard(),
      sendNotification,
      now: () => new Date('2026-11-24T12:00:00.000Z'),
    })

    const response = await post(worker, environment(), validLead)

    expect(response.status).toBe(202)
    expect(await response.json()).toMatchObject({ ok: true })
    expect(sendNotification).toHaveBeenCalledTimes(1)
    const notification = sendNotification.mock.calls[0][0]
    expect(notification.to).toBe('responsable@example.com')
    expect(notification.replyTo).toBe('ana@example.com')
    expect(notification.html).toContain('Nueva solicitud de presupuesto')
    expect(notification.text).toContain('Ana García')
  })

  it('rechaza un correo inválido sin llamar al proveedor', async () => {
    const sendNotification = acceptedSender()
    const worker = createWorker({
      abuseGuard: new MemoryAbuseGuard(),
      sendNotification,
    })

    const response = await post(worker, environment(), {
      ...validLead,
      email: 'correo-invalido',
    })
    const payload = await response.json()

    expect(response.status).toBe(422)
    expect(payload).toHaveProperty('errors.email')
    expect(sendNotification).not.toHaveBeenCalled()
  })

  it('rechaza campos obligatorios ausentes', async () => {
    const sendNotification = acceptedSender()
    const worker = createWorker({
      abuseGuard: new MemoryAbuseGuard(),
      sendNotification,
    })

    const response = await post(worker, environment(), { website: '' })
    const payload = await response.json()

    expect(response.status).toBe(422)
    expect(payload).toHaveProperty('errors.name')
    expect(payload).toHaveProperty('errors.phone')
    expect(payload).toHaveProperty('errors.email')
    expect(payload).toHaveProperty('errors.service')
    expect(payload).toHaveProperty('errors.details')
  })

  it('incluye y valida el servicio personalizado', async () => {
    const sendNotification = acceptedSender()
    const worker = createWorker({
      abuseGuard: new MemoryAbuseGuard(),
      sendNotification,
    })

    const validResponse = await post(worker, environment(), {
      ...validLead,
      service: 'otro',
      customService: 'Instalación de cámaras',
    })
    const invalidResponse = await post(worker, environment(), {
      ...validLead,
      service: 'otro',
      customService: '',
    })

    expect(validResponse.status).toBe(202)
    expect(sendNotification.mock.calls[0][0].subject).toContain(
      'Instalación de cámaras',
    )
    expect(invalidResponse.status).toBe(422)
  })

  it('descarta silenciosamente el honeypot sin enviar', async () => {
    const sendNotification = acceptedSender()
    const worker = createWorker({
      abuseGuard: new MemoryAbuseGuard(),
      sendNotification,
    })

    const response = await post(worker, environment(), {
      ...validLead,
      website: 'https://spam.invalid',
    })

    expect(response.status).toBe(200)
    expect(sendNotification).not.toHaveBeenCalled()
  })

  it('informa el fallo cuando Resend no está disponible', async () => {
    const fetcher = vi.fn(async () => new Response('unavailable', { status: 503 }))
    const worker = createWorker({
      abuseGuard: new MemoryAbuseGuard(),
      fetcher: fetcher as typeof fetch,
    })

    const response = await post(worker, environment(), validLead)

    expect(response.status).toBe(502)
    expect(await response.json()).toMatchObject({ ok: false })
  })

  it('no simula éxito si falta el token de Resend', async () => {
    const sendNotification = acceptedSender()
    const worker = createWorker({
      abuseGuard: new MemoryAbuseGuard(),
      sendNotification,
    })

    const response = await post(
      worker,
      environment({ RESEND_API_KEY: undefined }),
      validLead,
    )

    expect(response.status).toBe(503)
    expect(sendNotification).not.toHaveBeenCalled()
  })

  it('impide el doble envío de la misma solicitud', async () => {
    const sendNotification = acceptedSender()
    const worker = createWorker({
      abuseGuard: new MemoryAbuseGuard(),
      sendNotification,
    })

    const first = await post(worker, environment(), validLead)
    const second = await post(worker, environment(), validLead)

    expect(first.status).toBe(202)
    expect(second.status).toBe(409)
    expect(sendNotification).toHaveBeenCalledTimes(1)
  })

  it('solo confirma éxito cuando Resend acepta la solicitud', async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      expect(init?.headers).toMatchObject({
        Authorization: 'Bearer test-api-key',
      })
      return Response.json({ id: 'resend-message-id' }, { status: 200 })
    })
    const worker = createWorker({
      abuseGuard: new MemoryAbuseGuard(),
      fetcher: fetcher as typeof fetch,
    })

    const response = await post(worker, environment(), validLead)

    expect(response.status).toBe(202)
    const requestBody = JSON.parse(
      (fetcher.mock.calls[0][1] as RequestInit).body as string,
    )
    expect(requestBody.reply_to).toBe('ana@example.com')
    expect(requestBody.from).toContain('@reformasmantenimiento.es')
    expect(requestBody.text).toContain('Descripción del proyecto')
  })

  it('delega assets y navegación SPA al binding de Cloudflare', async () => {
    const assets = assetBinding()
    const worker = createWorker()
    const env = environment({ ASSETS: assets as unknown as Fetcher })

    const css = await worker.fetch(
      new Request('https://reformasmantenimiento.es/assets/app.css'),
      env,
    )
    const navigation = await worker.fetch(
      new Request('https://reformasmantenimiento.es/servicios'),
      env,
    )

    expect(await css.text()).toBe('asset:/assets/app.css')
    expect(await navigation.text()).toBe('asset:/servicios')
    expect(assets.fetch).toHaveBeenCalledTimes(2)
  })
})

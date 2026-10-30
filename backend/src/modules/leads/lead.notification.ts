import { env } from '../../config/env'
import type { LeadInput } from './lead.validation'

const serviceLabels: Record<LeadInput['service'], string> = {
  construccion: 'Construcción',
  'reformas-integrales': 'Reformas integrales',
  electricidad: 'Electricidad',
  fontaneria: 'Fontanería',
  albanileria: 'Albañilería',
  mantenimiento: 'Mantenimiento',
  otro: 'Otro',
}

function buildNotificationMessage(lead: LeadInput): string {
  const serviceLabel = serviceLabels[lead.service]
  const selectedService =
    lead.service === 'otro' && lead.customService
      ? `${serviceLabel} (${lead.customService})`
      : serviceLabel

  return [
    `Nombre: ${lead.name}`,
    `Teléfono: ${lead.phone}`,
    `Correo: ${lead.email}`,
    `Servicio: ${selectedService}`,
    `Detalles: ${lead.details}`,
  ].join('\n')
}

export async function notifyLead(lead: LeadInput): Promise<void> {
  if (env.LEAD_NOTIFICATION_PROVIDER === 'none') {
    return
  }

  const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(
    env.LEAD_NOTIFICATION_EMAIL,
  )}`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Web Vaycho',
      email: 'notificaciones@vaycho.local',
      subject: 'Nuevo cliente desde la web',
      message: buildNotificationMessage(lead),
      _captcha: 'false',
      _template: 'table',
    }),
  })

  if (!response.ok) {
    throw new Error(`Lead notification failed with status ${response.status}`)
  }
}

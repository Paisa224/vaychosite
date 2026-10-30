import type { LeadFormErrors, LeadFormValues } from './lead.types'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^\+?[0-9\s-]{7,15}$/

export function validateLeadForm(values: LeadFormValues): LeadFormErrors {
  const errors: LeadFormErrors = {}

  if (values.name.trim().length < 2) {
    errors.name = 'Ingresa un nombre válido.'
  }

  if (!phoneRegex.test(values.phone.trim())) {
    errors.phone = 'Ingresa un teléfono válido (7 a 15 dígitos).'
  }

  if (!emailRegex.test(values.email.trim())) {
    errors.email = 'Ingresa un correo electrónico válido.'
  }

  if (!values.service) {
    errors.service = 'Selecciona el servicio que necesitas.'
  }

  if (values.service === 'otro' && values.customService.trim().length < 3) {
    errors.customService = 'Especifica el servicio que necesitas.'
  }

  if (values.details.trim().length < 10) {
    errors.details = 'Cuéntanos al menos 10 caracteres sobre tu proyecto.'
  }

  return errors
}

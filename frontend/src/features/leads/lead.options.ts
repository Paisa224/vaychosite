import type { ServiceType } from './lead.types'

export interface ServiceOption {
  value: ServiceType
  label: string
}

export const serviceOptions: ServiceOption[] = [
  { value: 'construccion', label: 'Construcción y obra nueva' },
  { value: 'reformas-integrales', label: 'Reformas integrales' },
  { value: 'electricidad', label: 'Electricidad residencial e industrial' },
  { value: 'fontaneria', label: 'Fontanería y saneamiento' },
  { value: 'albanileria', label: 'Albañilería estructural' },
  { value: 'mantenimiento', label: 'Mantenimiento integral' },
  { value: 'otro', label: 'Otro (quiero otro tipo de servicio)' },
]

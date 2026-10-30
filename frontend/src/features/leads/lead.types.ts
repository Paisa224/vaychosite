export type ServiceType =
  | 'construccion'
  | 'reformas-integrales'
  | 'electricidad'
  | 'fontaneria'
  | 'albanileria'
  | 'mantenimiento'
  | 'otro'

export interface LeadFormValues {
  name: string
  phone: string
  email: string
  service: ServiceType | ''
  customService: string
  details: string
  website: string
}

export type LeadFormErrors = Partial<Record<keyof LeadFormValues, string>>

export type LeadServiceType =
  | 'construccion'
  | 'reformas-integrales'
  | 'electricidad'
  | 'fontaneria'
  | 'albanileria'
  | 'mantenimiento'
  | 'otro'

export interface LeadRecord {
  id: string
  name: string
  phone: string
  email: string
  service: LeadServiceType
  customService?: string
  details: string
  source: 'website'
  storage: 'memory' | 'prisma-simulated'
  createdAt: string
}

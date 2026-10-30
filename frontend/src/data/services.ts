import {
  Building2,
  Drill,
  Droplets,
  Hammer,
  PaintRoller,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export interface ServiceCard {
  title: string
  description: string
  icon: LucideIcon
}

export const services: ServiceCard[] = [
  {
    title: 'Construcción',
    description: 'Ejecución de obra nueva, ampliaciones y gestión completa de proyecto.',
    icon: Building2,
  },
  {
    title: 'Reformas Integrales',
    description: 'Rediseño de espacios con acabados premium y control riguroso de tiempos.',
    icon: PaintRoller,
  },
  {
    title: 'Electricidad',
    description: 'Instalaciones certificadas, tableros, iluminación y automatización.',
    icon: Zap,
  },
  {
    title: 'Fontanería',
    description: 'Redes hidráulicas, reparaciones urgentes y sistemas de presión.',
    icon: Droplets,
  },
  {
    title: 'Albañilería',
    description: 'Trabajos estructurales y de acabado con mano de obra especializada.',
    icon: Hammer,
  },
  {
    title: 'Mantenimiento',
    description: 'Planes preventivos y correctivos para empresas, locales y comunidades.',
    icon: Drill,
  },
]

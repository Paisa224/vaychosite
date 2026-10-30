import { SendHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { serviceOptions } from '../../features/leads/lead.options'
import type { LeadFormErrors, LeadFormValues } from '../../features/leads/lead.types'
import { validateLeadForm } from '../../features/leads/lead.validation'

const initialFormValues: LeadFormValues = {
  name: '',
  phone: '',
  email: '',
  service: '',
  customService: '',
  details: '',
  website: '',
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'
const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export function LeadCaptureForm() {
  const [values, setValues] = useState<LeadFormValues>(initialFormValues)
  const [errors, setErrors] = useState<LeadFormErrors>({})
  const [status, setStatus] = useState<SubmitStatus>('idle')

  const statusMessage = useMemo(() => {
    if (status === 'success') {
      return 'Solicitud enviada. Te contactaremos en menos de 24 horas.'
    }

    if (status === 'error') {
      return 'No fue posible enviar tu solicitud. Intenta nuevamente.'
    }

    return ''
  }, [status])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationErrors = validateLeadForm(values)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setStatus('loading')

    try {
      const response = await fetch(`${apiBaseUrl}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error('API_ERROR')
      }

      setValues(initialFormValues)
      setErrors({})
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contacto" className="mt-16 animate-reveal [animation-delay:240ms]">
      <div className="grid gap-8 rounded-3xl border border-white/10 bg-carbon-900/80 p-6 shadow-soft backdrop-blur-sm sm:p-10 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-300">
            Captación de clientes
          </p>
          <h2 className="font-display text-3xl font-bold text-cloud sm:text-4xl">
            Cuéntanos tu proyecto y recibe una propuesta personalizada
          </h2>
          <p className="text-base text-slate-300">
            Deja tus datos y nuestro equipo técnico se pondrá en contacto para
            definir alcance, tiempos y presupuesto estimado.
          </p>
        </div>

        <form className="relative space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Nombre"
              name="name"
              value={values.name}
              onChange={(value) => setValues((current) => ({ ...current, name: value }))}
              error={errors.name}
            />
            <Field
              label="Teléfono"
              name="phone"
              value={values.phone}
              onChange={(value) =>
                setValues((current) => ({ ...current, phone: value }))
              }
              error={errors.phone}
            />
          </div>

          <Field
            label="Correo"
            name="email"
            value={values.email}
            onChange={(value) => setValues((current) => ({ ...current, email: value }))}
            error={errors.email}
            type="email"
          />

          <label className="block text-sm font-semibold text-slate-100">
            Servicio requerido
            <select
              name="service"
              value={values.service}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  service: event.target.value as LeadFormValues['service'],
                  customService:
                    event.target.value === 'otro' ? current.customService : '',
                }))
              }
              className="mt-2 w-full rounded-xl border border-white/15 bg-carbon-800 px-4 py-3 text-base text-slate-100 outline-none transition-colors duration-300 focus:border-accent-400"
            >
              <option value="">Selecciona una opción</option>
              {serviceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.service ? (
              <span className="mt-1 block text-sm text-accent-300">{errors.service}</span>
            ) : null}
          </label>

          {values.service === 'otro' ? (
            <Field
              label="¿Qué servicio necesitas?"
              name="customService"
              value={values.customService}
              onChange={(value) =>
                setValues((current) => ({ ...current, customService: value }))
              }
              error={errors.customService}
              placeholder="Ejemplo: instalación de cámaras, pladur, impermeabilización"
            />
          ) : null}

          <label className="block text-sm font-semibold text-slate-100">
            Detalles del proyecto
            <textarea
              name="details"
              value={values.details}
              onChange={(event) =>
                setValues((current) => ({ ...current, details: event.target.value }))
              }
              rows={4}
              className="mt-2 w-full rounded-xl border border-white/15 bg-carbon-800 px-4 py-3 text-base text-slate-100 outline-none transition-colors duration-300 focus:border-accent-400"
              placeholder="Ejemplo: reforma de cocina de 20m2, cambio de instalación eléctrica y fontanería"
            />
            {errors.details ? (
              <span className="mt-1 block text-sm text-accent-300">{errors.details}</span>
            ) : null}
          </label>

          <label className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
            Sitio web (dejar vacío)
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={values.website}
              onChange={(event) =>
                setValues((current) => ({ ...current, website: event.target.value }))
              }
            />
          </label>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent-500 px-6 py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === 'loading' ? 'Enviando solicitud...' : 'Solicitar llamada'}
            <SendHorizontal className="h-4 w-4" />
          </button>

          {statusMessage ? (
            <p
              className={`text-sm ${
                status === 'success' ? 'text-electric-300' : 'text-accent-300'
              }`}
            >
              {statusMessage}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  )
}

interface FieldProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  error?: string
  type?: 'text' | 'email' | 'tel'
  placeholder?: string
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
}: FieldProps) {
  return (
    <label className="block text-sm font-semibold text-slate-100">
      {label}
      <input
        type={type}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-white/15 bg-carbon-800 px-4 py-3 text-base text-slate-100 outline-none transition-colors duration-300 focus:border-accent-400"
      />
      {error ? <span className="mt-1 block text-sm text-accent-300">{error}</span> : null}
    </label>
  )
}

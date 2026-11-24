import { SendHorizontal } from 'lucide-react'
import { useRef, useState } from 'react'
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
const leadsEndpoint = '/api/leads'

export function LeadCaptureForm() {
  const [values, setValues] = useState<LeadFormValues>(initialFormValues)
  const [errors, setErrors] = useState<LeadFormErrors>({})
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const submittingRef = useRef(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (submittingRef.current) return

    const validationErrors = validateLeadForm(values)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      setStatus('error')
      setStatusMessage('Revisa los campos indicados antes de enviar.')
      return
    }

    submittingRef.current = true
    setStatus('loading')
    setStatusMessage('')
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 20_000)

    try {
      const response = await fetch(leadsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
        signal: controller.signal,
      })
      const payload =
        response.status === 204
          ? undefined
          : ((await response.json().catch(() => undefined)) as
              | { message?: string; errors?: LeadFormErrors }
              | undefined)

      if (!response.ok) {
        if (payload?.errors) setErrors(payload.errors)
        setStatus('error')
        setStatusMessage(
          payload?.message ??
            'No fue posible enviar tu solicitud. Intenta nuevamente.',
        )
        return
      }

      setValues(initialFormValues)
      setErrors({})
      setStatus('success')
      setStatusMessage('Solicitud enviada. Te contactaremos en menos de 24 horas.')
    } catch {
      setStatus('error')
      setStatusMessage(
        'No pudimos conectar con el servicio. Comprueba tu conexión e inténtalo de nuevo.',
      )
    } finally {
      window.clearTimeout(timeout)
      submittingRef.current = false
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
              autoComplete="name"
              maxLength={120}
            />
            <Field
              label="Teléfono"
              name="phone"
              value={values.phone}
              onChange={(value) =>
                setValues((current) => ({ ...current, phone: value }))
              }
              error={errors.phone}
              type="tel"
              autoComplete="tel"
              maxLength={20}
            />
          </div>

          <Field
            label="Correo"
            name="email"
            value={values.email}
            onChange={(value) => setValues((current) => ({ ...current, email: value }))}
            error={errors.email}
            type="email"
            autoComplete="email"
            maxLength={150}
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
              aria-invalid={Boolean(errors.service)}
              aria-describedby={errors.service ? 'service-error' : undefined}
              required
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
              <span id="service-error" className="mt-1 block text-sm text-accent-300">
                {errors.service}
              </span>
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
              maxLength={120}
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
              maxLength={1000}
              required
              aria-invalid={Boolean(errors.details)}
              aria-describedby={errors.details ? 'details-error' : undefined}
              className="mt-2 w-full rounded-xl border border-white/15 bg-carbon-800 px-4 py-3 text-base text-slate-100 outline-none transition-colors duration-300 focus:border-accent-400"
              placeholder="Ejemplo: reforma de cocina de 20m2, cambio de instalación eléctrica y fontanería"
            />
            {errors.details ? (
              <span id="details-error" className="mt-1 block text-sm text-accent-300">
                {errors.details}
              </span>
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
            aria-busy={status === 'loading'}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent-500 px-6 py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === 'loading' ? 'Enviando solicitud...' : 'Solicitar llamada'}
            <SendHorizontal className="h-4 w-4" />
          </button>

          {statusMessage ? (
            <p
              role={status === 'error' ? 'alert' : 'status'}
              aria-live={status === 'error' ? 'assertive' : 'polite'}
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
  autoComplete?: string
  maxLength?: number
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  autoComplete,
  maxLength,
}: FieldProps) {
  const errorId = `${name}-error`

  return (
    <label className="block text-sm font-semibold text-slate-100">
      {label}
      <input
        type={type}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="mt-2 w-full rounded-xl border border-white/15 bg-carbon-800 px-4 py-3 text-base text-slate-100 outline-none transition-colors duration-300 focus:border-accent-400"
      />
      {error ? (
        <span id={errorId} className="mt-1 block text-sm text-accent-300">
          {error}
        </span>
      ) : null}
    </label>
  )
}

import { ArrowRight, ShieldCheck, TimerReset } from 'lucide-react'

export function HeroSection() {
  return (
    <section id="inicio" className="animate-reveal">
      <div className="grid gap-10 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <p className="inline-flex items-center rounded-full border border-accent-400/50 bg-accent-500/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent-300">
            Construcción y servicios integrales
          </p>

          <h1 className="font-display text-4xl font-bold leading-tight text-cloud sm:text-5xl">
            Reformamos y construimos espacios que generan confianza desde el
            primer vistazo.
          </h1>

          <p className="max-w-xl text-lg text-slate-300">
            Equipo técnico certificado para obras, reformas, electricidad,
            fontanería y mantenimiento con tiempos de respuesta reales y
            supervisión continua.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#contacto"
              className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-6 py-3 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-400"
            >
              Solicitar presupuesto
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#servicios"
              className="inline-flex rounded-full border border-white/25 px-6 py-3 text-base font-semibold text-slate-100 transition-colors duration-300 hover:border-electric-400 hover:text-electric-300"
            >
              Ver servicios
            </a>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="animate-float rounded-2xl border border-white/10 bg-carbon-800/70 p-5 shadow-soft">
            <TimerReset className="h-7 w-7 text-electric-400" />
            <h2 className="mt-4 font-display text-xl font-semibold text-cloud">
              Respuesta en menos de 24h
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Diagnóstico inicial y propuesta económica en tiempo récord.
            </p>
          </article>

          <article className="animate-float rounded-2xl border border-white/10 bg-carbon-800/70 p-5 shadow-soft [animation-delay:1.2s]">
            <ShieldCheck className="h-7 w-7 text-accent-400" />
            <h2 className="mt-4 font-display text-xl font-semibold text-cloud">
              Garantía y seguridad
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Procedimientos homologados y seguimiento profesional de obra.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}

import { services } from '../../data/services'

export function ServicesGrid() {
  const bentoClasses = [
    'sm:col-span-2 xl:col-span-2 xl:row-span-2',
    'xl:col-span-2',
    'xl:col-span-1',
    'xl:col-span-1',
    'xl:col-span-2',
    'xl:col-span-2',
  ]

  return (
    <section id="servicios" className="mt-16 animate-reveal [animation-delay:120ms]">
      <div className="mb-8 space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-electric-300">
          Especialidades
        </p>
        <h2 className="font-display text-3xl font-bold text-cloud sm:text-4xl">
          Soluciones tecnicas para cada fase del proyecto
        </h2>
      </div>

      <div className="grid auto-rows-[minmax(180px,1fr)] gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {services.map(({ title, description, icon: Icon }, index) => (
          <article
            key={title}
            className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-soft backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:scale-[1.01] hover:border-accent-400/60 ${bentoClasses[index] ?? ''}`}
          >
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-accent-500/20 blur-3xl transition-all duration-500 group-hover:scale-125 group-hover:bg-electric-500/20" />

            <div className="relative inline-flex rounded-xl border border-electric-400/60 bg-electric-500/20 p-3 text-electric-300 transition-all duration-500 group-hover:-rotate-3 group-hover:scale-110 group-hover:border-accent-400/70 group-hover:bg-accent-500/20 group-hover:text-accent-300">
              <Icon className="h-6 w-6" />
            </div>

            <h3 className="relative mt-5 font-display text-2xl font-semibold text-cloud transition-colors duration-500 group-hover:text-white">
              {title}
            </h3>

            <p className="relative mt-3 max-w-xl text-base text-slate-300 transition-colors duration-500 group-hover:text-slate-200">
              {description}
            </p>

            <span className="relative mt-6 inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 transition-all duration-500 group-hover:border-accent-400/70 group-hover:bg-accent-500/15 group-hover:text-accent-200">
              Equipo certificado
            </span>
          </article>
        ))}
      </div>
    </section>
  )
}

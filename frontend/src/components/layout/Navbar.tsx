import { Building2, PhoneCall } from 'lucide-react'
import { useEffect, useState } from 'react'

const navLinks = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Contacto', href: '#contacto' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12)

    window.addEventListener('scroll', onScroll)
    onScroll()

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'border-b border-white/10 bg-carbon-900/90 shadow-soft backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href="#inicio"
          className="group inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-cloud"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-accent-400 transition-all duration-300 group-hover:border-accent-400 group-hover:bg-accent-500/20">
            <Building2 className="h-5 w-5" />
          </span>
          M&C Obras Integrales
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium tracking-wide text-slate-200 transition-colors duration-300 hover:text-accent-400"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#contacto"
          className="inline-flex items-center gap-2 rounded-full border border-electric-400/60 bg-electric-500/15 px-4 py-2 text-sm font-semibold text-electric-400 transition-all duration-300 hover:-translate-y-0.5 hover:bg-electric-500/25"
        >
          <PhoneCall className="h-4 w-4" />
          Cotizar
        </a>
      </div>
    </header>
  )
}

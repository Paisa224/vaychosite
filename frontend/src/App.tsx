import { Navbar } from './components/layout/Navbar'
import { HeroSection } from './components/sections/HeroSection'
import { BeforeAfterSlider } from './components/sections/BeforeAfterSlider'
import { ServicesGrid } from './components/sections/ServicesGrid'
import { LeadCaptureForm } from './components/sections/LeadCaptureForm'

function App() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-site text-cloud">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-200px] h-[430px] w-[430px] -translate-x-1/2 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="absolute -left-24 top-[40%] h-72 w-72 rounded-full bg-electric-500/15 blur-3xl" />
      </div>

      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <HeroSection />
        <BeforeAfterSlider />
        <ServicesGrid />
        <LeadCaptureForm />
      </main>
    </div>
  )
}

export default App

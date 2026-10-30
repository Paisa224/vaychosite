import { useEffect, useRef, useState } from 'react'

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const compositeImageCandidates = [
  '/images/bano-before-after.jpg',
  '/images/bano-before-after.jpg.jpg',
  '/images/bano-before-after.jpeg',
  '/images/bano-before-after.png',
  '/images/bano-before-after.webp',
]
const fallbackBeforeImagePath = '/images/before-reforma.svg'
const fallbackAfterImagePath = '/images/after-reforma.svg'

export function BeforeAfterSlider() {
  const sliderRef = useRef<HTMLDivElement | null>(null)
  const [position, setPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [compositeImagePath, setCompositeImagePath] = useState<string | null>(null)
  const [isCompositeReady, setIsCompositeReady] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadImageCandidate = (index: number) => {
      if (!isMounted) {
        return
      }

      if (index >= compositeImageCandidates.length) {
        setCompositeImagePath(null)
        setIsCompositeReady(false)
        return
      }

      const candidate = compositeImageCandidates[index]
      const previewImage = new Image()

      previewImage.onload = () => {
        if (!isMounted) {
          return
        }

        setCompositeImagePath(candidate)
        setIsCompositeReady(true)
      }

      previewImage.onerror = () => {
        loadImageCandidate(index + 1)
      }

      previewImage.src = candidate
    }

    loadImageCandidate(0)

    return () => {
      isMounted = false
    }
  }, [])

  const updatePosition = (clientX: number) => {
    const element = sliderRef.current

    if (!element) {
      return
    }

    const rect = element.getBoundingClientRect()
    const next = ((clientX - rect.left) / rect.width) * 100
    setPosition(clamp(next, 5, 95))
  }

  const startDragging = () => setIsDragging(true)

  const stopDragging = () => setIsDragging(false)

  return (
    <section className="mt-16 animate-reveal [animation-delay:80ms]">
      <div className="mb-8 space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-300">
          Antes y después
        </p>
        <h2 className="font-display text-3xl font-bold text-cloud sm:text-4xl">
          Visualiza la transformación real de una reforma de baño
        </h2>
      </div>

      <div
        ref={sliderRef}
        className="relative mx-auto w-full max-w-[760px] select-none touch-none overflow-hidden rounded-3xl border border-white/15 bg-carbon-800/40 shadow-soft aspect-[8/9]"
        onPointerDown={(event) => {
          if (typeof event.currentTarget.setPointerCapture === 'function') {
            try {
              event.currentTarget.setPointerCapture(event.pointerId)
            } catch {
              // Some mobile browsers may fail pointer capture; drag still works via move handlers.
            }
          }

          startDragging()
          updatePosition(event.clientX)
        }}
        onPointerMove={(event) => {
          if (isDragging) {
            updatePosition(event.clientX)
          }
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }
          stopDragging()
        }}
        onPointerCancel={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }
          stopDragging()
        }}
        onPointerLeave={() => {
          stopDragging()
        }}
        onTouchStart={(event) => {
          startDragging()
          updatePosition(event.touches[0].clientX)
        }}
        onTouchMove={(event) => {
          if (isDragging) {
            event.preventDefault()
            updatePosition(event.touches[0].clientX)
          }
        }}
        onTouchEnd={() => {
          stopDragging()
        }}
        onTouchCancel={() => {
          stopDragging()
        }}
      >
        {isCompositeReady && compositeImagePath ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${compositeImagePath})`,
                backgroundPosition: 'right center',
                backgroundSize: '200% 100%',
              }}
            />

            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            >
              <div
                className="h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${compositeImagePath})`,
                  backgroundPosition: 'left center',
                  backgroundSize: '200% 100%',
                }}
              />
            </div>
          </>
        ) : (
          <>
            <img
              src={fallbackBeforeImagePath}
              alt="Estado inicial del espacio antes de la reforma"
              className="h-full w-full object-cover"
              draggable={false}
            />

            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            >
              <img
                src={fallbackAfterImagePath}
                alt="Resultado final tras la reforma"
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
          </>
        )}

        <div
          className="pointer-events-none absolute inset-y-0 z-10 w-1 bg-white/80"
          style={{ left: `calc(${position}% - 2px)` }}
        />

        <button
          type="button"
          aria-label="Control de comparación antes y después"
          className="pointer-events-none absolute top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-carbon-900/85 text-sm font-semibold text-cloud shadow-soft"
          style={{ left: `calc(${position}% - 24px)` }}
        >
          ||
        </button>

        <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-black/35 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
          Antes
        </span>
        <span className="absolute right-4 top-4 rounded-full border border-white/25 bg-black/35 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
          Después
        </span>

        <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs font-semibold text-white/90">
          Arrastra el control para comparar
        </p>
      </div>
    </section>
  )
}

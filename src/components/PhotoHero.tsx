import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Tint = 'green' | 'warm' | 'slate'

const TINT_CLASS: Record<Tint, string> = {
  green: 'from-highland-950/90 via-highland-900/65 to-highland-800/30',
  warm: 'from-black/80 via-highland-950/55 to-black/25',
  slate: 'from-slate-950/85 via-highland-950/60 to-highland-900/25',
}

type PhotoHeroProps = {
  photo: string
  alt: string
  children: ReactNode
  className?: string
  tint?: Tint
  minHeight?: string
  to?: string
}

function HeroSurface({
  photo, alt, children, className, tint, minHeight,
}: Omit<PhotoHeroProps, 'to'>) {
  return (
    <div
      className={`relative overflow-hidden bg-highland-800 ${className ?? ''}`}
      style={{ minHeight }}
    >
      <img
        src={photo}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        decoding="async"
      />
      <div className={`absolute inset-0 bg-gradient-to-t ${TINT_CLASS[tint ?? 'green']}`} />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export function PhotoHero({
  photo, alt, children, className = 'rounded-3xl shadow-lg',
  tint = 'green', minHeight = '11rem', to,
}: PhotoHeroProps) {
  const surface = (
    <HeroSurface photo={photo} alt={alt} className={className} tint={tint} minHeight={minHeight}>
      {children}
    </HeroSurface>
  )

  if (to) {
    return (
      <Link to={to} className="animate-fade-in block transition active:scale-[0.99]">
        {surface}
      </Link>
    )
  }

  return <div className="animate-fade-in">{surface}</div>
}

export function DayPhotoThumb({ dayNumber, photo, alt }: { dayNumber: number; photo: string; alt: string }) {
  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-highland-200 shadow-sm">
      <img src={photo} alt={alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      <div className="relative flex h-full flex-col items-center justify-center bg-highland-950/45 text-white">
        <span className="text-[9px] font-semibold uppercase leading-none">Dia</span>
        <span className="text-lg font-bold leading-none">{dayNumber}</span>
      </div>
    </div>
  )
}

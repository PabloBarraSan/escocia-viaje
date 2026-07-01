import type { ReactNode } from 'react'

export function PageSection({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <div className="px-0.5">
        <h2 className="font-display text-lg font-bold text-highland-900">{title}</h2>
        {hint && <p className="mt-0.5 text-sm text-gray-500">{hint}</p>}
      </div>
      {children}
    </section>
  )
}

export function FeaturedCard({
  eyebrow,
  title,
  badge,
  children,
  className = '',
}: {
  eyebrow: string
  title: string
  badge?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-2xl border border-highland-200 bg-white p-4 shadow-sm ring-1 ring-highland-100/80 ${className}`}>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-highland-600">{eyebrow}</p>
          <h2 className="font-display text-2xl font-bold text-highland-900">{title}</h2>
        </div>
        {badge && (
          <span className="rounded-full bg-highland-50 px-2.5 py-1 text-xs font-semibold text-highland-700">
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  )
}

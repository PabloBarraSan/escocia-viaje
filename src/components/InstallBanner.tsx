import { useEffect, useState } from 'react'
import { Download, Mountain, Share, X } from 'lucide-react'
import {
  requestInstallPrompt,
  SHOW_INSTALL_EVENT,
  useInstallApp,
} from '../hooks/useInstallApp'

function InstallHelp({
  mode,
}: {
  mode: 'ios' | 'chrome'
}) {
  if (mode === 'ios') {
    return (
      <div className="mt-4 rounded-2xl bg-blue-50 p-3 text-sm text-blue-950">
        <p className="flex items-center gap-2 font-bold"><Share size={17} /> En Safari:</p>
        <p className="mt-1">1. Prem el botó Compartir.</p>
        <p>2. Tria «Afegir a la pantalla d’inici».</p>
        <p>3. Prem «Afegir».</p>
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-2xl bg-highland-50 p-3 text-sm text-highland-950">
      <p className="font-bold">Al navegador:</p>
      <p className="mt-1">1. Obre el menú del navegador (⋮ o similar).</p>
      <p>2. Tria «Instal·lar aplicació» o «Afegir a la pantalla d’inici».</p>
      <p className="mt-2 text-xs text-highland-700">A l’ordinador, busca la icona d’instal·lació a la barra d’adreces.</p>
    </div>
  )
}

type PanelProps = {
  variant?: 'banner' | 'card'
  onDismiss?: () => void
}

export function InstallAppPanel({ variant = 'card', onDismiss }: PanelProps) {
  const { canInstall, helpMode, install } = useInstallApp()
  const [loading, setLoading] = useState(false)

  if (!canInstall) {
    return (
      <p className="text-sm text-gray-500">L’app ja està instal·lada o s’obre des de la pantalla principal.</p>
    )
  }

  const handleInstall = async () => {
    setLoading(true)
    try {
      await install()
    } finally {
      setLoading(false)
    }
  }

  const isBanner = variant === 'banner'

  return (
    <div className={isBanner ? '' : 'space-y-3'}>
      <div className={`flex items-start gap-3 ${isBanner ? 'pr-7' : ''}`}>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-highland-700 text-white">
          <Mountain size={25} />
        </div>
        <div>
          <h2 className={`font-bold text-highland-900 ${isBanner ? '' : 'text-lg'}`}>Instal·lar l’app d’Escòcia</h2>
          <p className="mt-1 text-sm text-gray-600">
            La tindràs a la pantalla principal i funcionarà millor sense cobertura.
          </p>
        </div>
      </div>

      {helpMode ? (
        <InstallHelp mode={helpMode} />
      ) : (
        <button
          type="button"
          onClick={() => void handleInstall()}
          disabled={loading}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-highland-700 py-3 text-base font-bold text-white disabled:opacity-60 ${isBanner ? 'mt-4' : ''}`}
        >
          <Download size={20} /> {loading ? 'Obrint…' : 'Instal·lar ara'}
        </button>
      )}

      {onDismiss && !helpMode && (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-2 w-full text-center text-xs text-gray-400 underline-offset-2 hover:underline"
        >
          Ara no
        </button>
      )}
    </div>
  )
}

export function InstallAppCard() {
  const { canInstall } = useInstallApp()
  if (!canInstall) return null

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <InstallAppPanel variant="card" />
    </section>
  )
}

export function InstallBanner() {
  const { canInstall, isIos, isDismissed, dismiss, resetDismissal } = useInstallApp()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!canInstall) return

    const show = () => {
      resetDismissal()
      setVisible(true)
    }

    if (!isDismissed) {
      const delay = isIos ? 800 : 2000
      const timer = window.setTimeout(() => setVisible(true), delay)
      window.addEventListener(SHOW_INSTALL_EVENT, show)
      return () => {
        window.clearTimeout(timer)
        window.removeEventListener(SHOW_INSTALL_EVENT, show)
      }
    }

    window.addEventListener(SHOW_INSTALL_EVENT, show)
    return () => window.removeEventListener(SHOW_INSTALL_EVENT, show)
  }, [canInstall, isDismissed, isIos, resetDismissal])

  const handleDismiss = () => {
    dismiss()
    setVisible(false)
  }

  if (!canInstall || !visible) return null

  return (
    <aside className="fixed bottom-20 left-3 right-3 z-[60] mx-auto max-w-md rounded-3xl border border-highland-200 bg-white p-4 shadow-2xl">
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400"
        aria-label="Tancar"
      >
        <X size={18} />
      </button>
      <InstallAppPanel variant="banner" onDismiss={handleDismiss} />
    </aside>
  )
}

export { requestInstallPrompt }

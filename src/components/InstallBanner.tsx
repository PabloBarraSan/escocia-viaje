import { useEffect, useState } from 'react'
import { Download, Mountain, Share, X } from 'lucide-react'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
}

export function InstallBanner() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [showIosHelp, setShowIosHelp] = useState(false)
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)

  useEffect(() => {
    if (isStandalone() || localStorage.getItem('install_banner_dismissed') === 'true') return

    if (isIos) {
      setVisible(true)
      return
    }

    const handlePrompt = (event: Event) => {
      event.preventDefault()
      setPrompt(event as InstallPromptEvent)
      setVisible(true)
    }
    const handleInstalled = () => setVisible(false)
    window.addEventListener('beforeinstallprompt', handlePrompt)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [isIos])

  const install = async () => {
    if (isIos) {
      setShowIosHelp(true)
      return
    }
    if (!prompt) return
    await prompt.prompt()
    const choice = await prompt.userChoice
    if (choice.outcome === 'accepted') setVisible(false)
    setPrompt(null)
  }

  const dismiss = () => {
    localStorage.setItem('install_banner_dismissed', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <aside className="fixed bottom-20 left-3 right-3 z-[60] mx-auto max-w-md rounded-3xl border border-highland-200 bg-white p-4 shadow-2xl">
      <button onClick={dismiss} className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400" aria-label="Tancar">
        <X size={18} />
      </button>
      <div className="flex items-start gap-3 pr-7">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-highland-700 text-white">
          <Mountain size={25} />
        </div>
        <div>
          <h2 className="font-bold text-highland-900">Instal·lar l’app d’Escòcia</h2>
          <p className="mt-1 text-sm text-gray-600">La tindràs a la pantalla principal i funcionarà millor sense cobertura.</p>
        </div>
      </div>
      {showIosHelp ? (
        <div className="mt-4 rounded-2xl bg-blue-50 p-3 text-sm text-blue-950">
          <p className="flex items-center gap-2 font-bold"><Share size={17} /> En Safari:</p>
          <p className="mt-1">1. Prem el botó Compartir.</p>
          <p>2. Tria «Afegir a la pantalla d’inici».</p>
          <p>3. Prem «Afegir».</p>
        </div>
      ) : (
        <button onClick={install} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-highland-700 py-3 text-base font-bold text-white">
          <Download size={20} /> Instal·lar ara
        </button>
      )}
    </aside>
  )
}

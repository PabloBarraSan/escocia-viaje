import { useCallback, useEffect, useState } from 'react'

const DISMISS_KEY = 'install_banner_dismissed_at'
const LEGACY_DISMISS_KEY = 'install_banner_dismissed'
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000

export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function isStandaloneApp() {
  return window.matchMedia('(display-mode: standalone)').matches
    || ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
}

export function isIosDevice() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export function isInstallDismissed() {
  const legacy = localStorage.getItem(LEGACY_DISMISS_KEY)
  if (legacy === 'true') {
    localStorage.removeItem(LEGACY_DISMISS_KEY)
    return false
  }
  const raw = localStorage.getItem(DISMISS_KEY)
  if (!raw) return false
  const at = Number(raw)
  if (!Number.isFinite(at)) return false
  return Date.now() - at < DISMISS_MS
}

export function dismissInstallBanner() {
  localStorage.removeItem(LEGACY_DISMISS_KEY)
  localStorage.setItem(DISMISS_KEY, String(Date.now()))
}

export function resetInstallDismissal() {
  localStorage.removeItem(LEGACY_DISMISS_KEY)
  localStorage.removeItem(DISMISS_KEY)
}

export const SHOW_INSTALL_EVENT = 'escocia:show-install'

export function requestInstallPrompt() {
  window.dispatchEvent(new Event(SHOW_INSTALL_EVENT))
}

export function useInstallApp() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null)
  const [helpMode, setHelpMode] = useState<'ios' | 'chrome' | null>(null)
  const isIos = isIosDevice()
  const standalone = isStandaloneApp()

  useEffect(() => {
    if (standalone) return
    const handlePrompt = (event: Event) => {
      event.preventDefault()
      setPrompt(event as InstallPromptEvent)
    }
    const handleInstalled = () => setPrompt(null)
    window.addEventListener('beforeinstallprompt', handlePrompt)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [standalone])

  const install = useCallback(async (): Promise<boolean> => {
    if (isIos) {
      setHelpMode('ios')
      return false
    }
    if (prompt) {
      await prompt.prompt()
      const choice = await prompt.userChoice
      if (choice.outcome === 'accepted') {
        setPrompt(null)
        return true
      }
      return false
    }
    setHelpMode('chrome')
    return false
  }, [isIos, prompt])

  return {
    canInstall: !standalone,
    isIos,
    hasNativePrompt: Boolean(prompt),
    helpMode,
    setHelpMode,
    install,
    isDismissed: isInstallDismissed(),
    dismiss: dismissInstallBanner,
    resetDismissal: resetInstallDismissal,
  }
}

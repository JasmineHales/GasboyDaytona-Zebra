import { useEffect } from 'react'

let openOverlayCount = 0

function syncMainShellInert() {
  const shell = document.getElementById('app-main-shell')
  if (!shell) return
  shell.inert = openOverlayCount > 0
}

export function registerOverlayLayer(): () => void {
  openOverlayCount += 1
  syncMainShellInert()
  return () => {
    openOverlayCount = Math.max(0, openOverlayCount - 1)
    syncMainShellInert()
  }
}

export function useOverlayLayer(open: boolean) {
  useEffect(() => {
    if (!open) return
    return registerOverlayLayer()
  }, [open])
}

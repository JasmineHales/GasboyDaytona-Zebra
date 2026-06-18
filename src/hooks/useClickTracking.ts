import { useEffect } from 'react'
import { initClickTracking } from '../utils/tracking'

export function useClickTracking() {
  useEffect(() => {
    return initClickTracking()
  }, [])
}

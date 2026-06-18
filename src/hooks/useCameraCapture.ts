import { useCallback, useRef } from 'react'

export function useCameraCapture(onCapture: (file: File) => void) {
  const inputRef = useRef<HTMLInputElement>(null)

  const openCamera = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) onCapture(file)
      event.target.value = ''
    },
    [onCapture],
  )

  return { openCamera, inputRef, handleInputChange }
}

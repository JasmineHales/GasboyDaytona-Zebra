import { useCallback, useEffect, useRef } from 'react'

type UseCameraCaptureOptions = {
  onCapture: (file: File) => void
  onCancel?: () => void
}

export function useCameraCapture({ onCapture, onCancel }: UseCameraCaptureOptions) {
  const inputRef = useRef<HTMLInputElement>(null)

  const openCamera = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        onCapture(file)
      }
      event.target.value = ''
    },
    [onCapture],
  )

  useEffect(() => {
    const input = inputRef.current
    if (!input || !onCancel) return

    const handleCancel = () => {
      onCancel()
    }

    input.addEventListener('cancel', handleCancel)
    return () => {
      input.removeEventListener('cancel', handleCancel)
    }
  }, [onCancel])

  return { openCamera, inputRef, handleInputChange }
}

import { AlertTriangle, Camera } from 'lucide-react'
import { useCallback } from 'react'
import { useCameraCapture } from '../../hooks/useCameraCapture'
import { useI18n } from '../../i18n/I18nProvider'
import { trackProps } from '../../utils/tracking'
import { WorkflowNotice } from '../ui/WorkflowNotice'

type StallOccupiedNoticeProps = {
  onTakePhoto: (file: File) => void
  trackPrefix?: string
}

export function StallOccupiedNotice({
  onTakePhoto,
  trackPrefix = 'stall',
}: StallOccupiedNoticeProps) {
  const { messages, t } = useI18n()
  const stallCopy = messages.stall

  const handleCapture = useCallback(
    (file: File) => {
      onTakePhoto(file)
    },
    [onTakePhoto],
  )

  const { openCamera, inputRef, handleInputChange } = useCameraCapture({
    onCapture: handleCapture,
  })

  return (
    <WorkflowNotice
      variant="warning"
      title={stallCopy.occupiedTitle}
      description={stallCopy.occupiedDescription}
      requirements={[...stallCopy.photoRequirements]}
      icon={<AlertTriangle className="h-4 w-4" />}
      footer={
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="fleet-sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={handleInputChange}
          />
          <button
            type="button"
            onClick={openCamera}
            className="fleet-btn fleet-btn-lg fleet-btn-contained-warning fleet-btn-elevated w-full"
            {...trackProps(`${trackPrefix}.take-photo`)}
          >
            <Camera className="h-5 w-5" />
            {t('stall.takePhoto')}
          </button>
        </>
      }
    />
  )
}

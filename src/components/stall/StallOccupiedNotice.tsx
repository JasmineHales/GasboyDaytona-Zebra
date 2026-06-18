import { AlertTriangle, Camera } from 'lucide-react'
import { useCallback } from 'react'
import { useCameraCapture } from '../../hooks/useCameraCapture'
import { trackProps } from '../../utils/tracking'
import { WorkflowNotice } from '../ui/WorkflowNotice'

const PHOTO_REQUIREMENTS = ['Stall Number', 'Entire stall & surroundings']

type StallOccupiedNoticeProps = {
  onTakePhoto: (file: File) => void
  trackPrefix?: string
}

export function StallOccupiedNotice({
  onTakePhoto,
  trackPrefix = 'stall',
}: StallOccupiedNoticeProps) {
  const handleCapture = useCallback(
    (file: File) => {
      onTakePhoto(file)
    },
    [onTakePhoto],
  )

  const { openCamera, inputRef, handleInputChange } = useCameraCapture(handleCapture)

  return (
    <WorkflowNotice
      variant="warning"
      title="Stall appears occupied"
      description="If this stall is available, take a photo to report the issue."
      requirements={PHOTO_REQUIREMENTS}
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
            Take Photo
          </button>
        </>
      }
    />
  )
}

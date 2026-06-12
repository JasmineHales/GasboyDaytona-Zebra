import { AlertTriangle, Camera } from 'lucide-react'
import { WorkflowNotice } from '../ui/WorkflowNotice'

const PHOTO_REQUIREMENTS = ['Stall Number', 'Entire stall & surroundings']

type StallOccupiedNoticeProps = {
  onTakePhoto: () => void
}

export function StallOccupiedNotice({ onTakePhoto }: StallOccupiedNoticeProps) {
  return (
    <WorkflowNotice
      variant="warning"
      title="Stall appears occupied"
      description="If this stall is available, take a photo to report the issue."
      requirements={PHOTO_REQUIREMENTS}
      icon={<AlertTriangle className="h-6 w-6" />}
      footer={
        <button
          type="button"
          onClick={onTakePhoto}
          className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
        >
          <Camera className="h-5 w-5" />
          Take Photo
        </button>
      }
    />
  )
}

import { Camera, Info } from 'lucide-react'
import { PhotoAttachmentPreview } from '../ui/PhotoAttachmentPreview'
import { WorkflowNotice } from '../ui/WorkflowNotice'
import { trackProps } from '../../utils/tracking'

type StallIssueReportedNoticeProps = {
  onRetakePhoto: () => void
  photoUrl?: string
  photoName?: string
  trackPrefix?: string
}

export function StallIssueReportedNotice({
  onRetakePhoto,
  photoUrl,
  photoName,
  trackPrefix = 'stall',
}: StallIssueReportedNoticeProps) {
  return (
    <WorkflowNotice
      variant="info"
      title="Issue reported"
      description="Photo attached successfully. You can continue once the stall is verified."
      icon={<Info className="h-6 w-6" />}
      footer={
        <>
          <PhotoAttachmentPreview
            fileName={photoName ?? 'IMG-26_256_2265_2563.jpog'}
            imageSrc={photoUrl}
          />
          <button
            type="button"
            onClick={onRetakePhoto}
            className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full"
            {...trackProps(`${trackPrefix}.retake-photo`)}
          >
            <Camera className="h-5 w-5" />
            Retake Photo
          </button>
        </>
      }
    />
  )
}

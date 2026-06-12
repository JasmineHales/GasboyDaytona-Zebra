import { Camera, Info } from 'lucide-react'
import { PhotoAttachmentPreview } from '../ui/PhotoAttachmentPreview'
import { WorkflowNotice } from '../ui/WorkflowNotice'

type StallIssueReportedNoticeProps = {
  onRetakePhoto: () => void
}

export function StallIssueReportedNotice({
  onRetakePhoto,
}: StallIssueReportedNoticeProps) {
  return (
    <WorkflowNotice
      variant="info"
      title="Issue reported"
      description="Photo attached successfully. You can continue once the stall is verified."
      icon={<Info className="h-6 w-6" />}
      footer={
        <>
          <PhotoAttachmentPreview fileName="IMG-26_256_2265_2563.jpog" />
          <button
            type="button"
            onClick={onRetakePhoto}
            className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full"
          >
            <Camera className="h-5 w-5" />
            Retake Photo
          </button>
        </>
      }
    />
  )
}

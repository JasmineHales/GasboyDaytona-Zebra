type PhotoAttachmentPreviewProps = {
  fileName: string
  timestamp?: string
  imageSrc?: string
  imageAlt?: string
}

const DEFAULT_PHOTO_SRC = '/stall-issue-photo.png'

export function PhotoAttachmentPreview({
  fileName,
  timestamp = 'just now',
  imageSrc = DEFAULT_PHOTO_SRC,
  imageAlt = 'Attached stall photo',
}: PhotoAttachmentPreviewProps) {
  return (
    <div className="flex w-full items-start gap-2">
      <div className="h-[100px] w-[150px] shrink-0 overflow-hidden rounded bg-[#cbd5e1]">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 text-sm text-[var(--color-text-primary)]">
        <p className="break-all font-semibold leading-snug" title={fileName}>
          {fileName}
        </p>
        <p className="text-[var(--color-text-primary)]">{timestamp}</p>
      </div>
    </div>
  )
}

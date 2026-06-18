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
  imageSrc,
  imageAlt = 'Attached stall photo',
}: PhotoAttachmentPreviewProps) {
  const src = imageSrc ?? DEFAULT_PHOTO_SRC
  return (
    <div className="flex w-full items-start gap-2">
      <div className="h-[100px] w-[150px] shrink-0 overflow-hidden rounded bg-[var(--color-fleet-disabled-bg)]">
        <img
          src={src}
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

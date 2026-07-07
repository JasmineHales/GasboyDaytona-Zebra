import { Camera, Mic, Square, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useId, useRef } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { useCameraCapture } from '../../hooks/useCameraCapture'
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder'
import { trackProps } from '../../utils/tracking'

export type IssuePhotoAttachment = {
  id: string
  file: File
  previewUrl: string
}

export type IssueVoiceAttachment = {
  blob: Blob
  previewUrl: string
  durationSeconds: number
}

type IssueDetailAttachmentsProps = {
  photos: IssuePhotoAttachment[]
  onPhotosChange: (photos: IssuePhotoAttachment[]) => void
  voiceNote: IssueVoiceAttachment | null
  onVoiceNoteChange: (voiceNote: IssueVoiceAttachment | null) => void
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function createPhotoAttachment(file: File): IssuePhotoAttachment {
  return {
    id: `${Date.now()}-${file.name}`,
    file,
    previewUrl: URL.createObjectURL(file),
  }
}

export function IssueDetailAttachments({
  photos,
  onPhotosChange,
  voiceNote,
  onVoiceNoteChange,
}: IssueDetailAttachmentsProps) {
  const { messages } = useI18n()
  const copy = messages.issue.attachments
  const photoInputId = useId()
  const photosRef = useRef(photos)
  const voiceNoteRef = useRef(voiceNote)
  photosRef.current = photos
  voiceNoteRef.current = voiceNote

  const {
    isRecording,
    durationSeconds,
    error: recorderError,
    startRecording,
    stopRecording,
  } = useVoiceRecorder()

  const handlePhotoCapture = useCallback(
    (file: File) => {
      onPhotosChange([...photos, createPhotoAttachment(file)])
    },
    [onPhotosChange, photos],
  )

  const { openCamera, inputRef, handleInputChange } = useCameraCapture({
    onCapture: handlePhotoCapture,
  })

  const removePhoto = (id: string) => {
    const target = photos.find((photo) => photo.id === id)
    if (target) URL.revokeObjectURL(target.previewUrl)
    onPhotosChange(photos.filter((photo) => photo.id !== id))
  }

  const removeVoiceNote = () => {
    if (voiceNote) URL.revokeObjectURL(voiceNote.previewUrl)
    onVoiceNoteChange(null)
  }

  const handleVoiceAction = async () => {
    if (isRecording) {
      const result = await stopRecording()
      if (!result) return

      if (voiceNote) URL.revokeObjectURL(voiceNote.previewUrl)
      onVoiceNoteChange({
        blob: result.blob,
        previewUrl: URL.createObjectURL(result.blob),
        durationSeconds: result.durationSeconds,
      })
      return
    }

    if (voiceNote) removeVoiceNote()
    await startRecording()
  }

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl))
      if (voiceNoteRef.current) URL.revokeObjectURL(voiceNoteRef.current.previewUrl)
    }
  }, [])

  const recorderErrorMessage =
    recorderError === 'permission'
      ? copy.microphonePermission
      : recorderError === 'unsupported'
        ? copy.microphoneUnsupported
        : null

  return (
    <div className="issue-detail-attachments">
      <div className="issue-detail-attachments__actions">
        <input
          ref={inputRef}
          id={photoInputId}
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
          className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full"
          {...trackProps('issue.details.add-photo')}
        >
          <Camera className="h-5 w-5" aria-hidden />
          {copy.addPhoto}
        </button>
        <button
          type="button"
          onClick={handleVoiceAction}
          className={`fleet-btn fleet-btn-lg w-full ${
            isRecording ? 'fleet-btn-contained-warning' : 'fleet-btn-outlined'
          }`}
          aria-pressed={isRecording}
          {...trackProps(
            isRecording ? 'issue.details.stop-voice' : 'issue.details.record-voice',
          )}
        >
          {isRecording ? (
            <Square className="h-5 w-5 fill-current" aria-hidden />
          ) : (
            <Mic className="h-5 w-5" aria-hidden />
          )}
          {isRecording
            ? copy.stopRecording.replace('{duration}', formatDuration(durationSeconds))
            : voiceNote
              ? copy.rerecordVoice
              : copy.recordVoice}
        </button>
      </div>

      {recorderErrorMessage ? (
        <p className="issue-detail-attachments__error" role="alert">
          {recorderErrorMessage}
        </p>
      ) : null}

      {photos.length > 0 ? (
        <ul className="issue-detail-attachments__photo-list" aria-label={copy.photoListAria}>
          {photos.map((photo) => (
            <li key={photo.id} className="issue-detail-attachments__photo-item">
              <img
                src={photo.previewUrl}
                alt={copy.photoAlt}
                className="issue-detail-attachments__photo-thumb"
              />
              <div className="issue-detail-attachments__photo-meta">
                <p className="issue-detail-attachments__photo-name">{photo.file.name}</p>
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  className="issue-detail-attachments__remove field-target"
                  aria-label={copy.removePhoto}
                  {...trackProps('issue.details.remove-photo')}
                >
                  <Trash2 className="h-5 w-5" aria-hidden />
                  {copy.removePhoto}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {voiceNote && !isRecording ? (
        <div className="issue-detail-attachments__voice" role="group" aria-label={copy.voiceNoteAria}>
          <audio
            controls
            src={voiceNote.previewUrl}
            className="issue-detail-attachments__voice-player"
            preload="metadata"
          />
          <p className="issue-detail-attachments__voice-duration">
            {copy.voiceDuration.replace('{duration}', formatDuration(voiceNote.durationSeconds))}
          </p>
          <button
            type="button"
            onClick={removeVoiceNote}
            className="issue-detail-attachments__remove field-target"
            aria-label={copy.removeVoice}
            {...trackProps('issue.details.remove-voice')}
          >
            <Trash2 className="h-5 w-5" aria-hidden />
            {copy.removeVoice}
          </button>
        </div>
      ) : null}
    </div>
  )
}

import type { ReactNode } from 'react'
import { trackProps } from '../../utils/tracking'

type PrimaryButtonVariant = 'primary' | 'success' | 'outlined'

type PrimaryButtonProps = {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: PrimaryButtonVariant
  className?: string
  trackTag?: string
  type?: 'button' | 'submit'
  'aria-describedby'?: string
}

const variantClass: Record<PrimaryButtonVariant, string> = {
  primary: 'fleet-btn-contained-info',
  success: 'fleet-btn-contained-success',
  outlined: 'fleet-btn-outlined',
}

export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  trackTag,
  type = 'button',
  'aria-describedby': ariaDescribedBy,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-describedby={ariaDescribedBy}
      className={`fleet-btn fleet-btn-lg ${variantClass[variant]} fleet-btn-elevated w-full ${className}`.trim()}
      {...(trackTag ? trackProps(trackTag) : {})}
    >
      {children}
    </button>
  )
}

import type { Messages } from '../i18n/types'

type PumpVerifyModeCopy = Messages['fuel']['pumpVerify']['default']

export function getPumpVerifyCopy(
  messages: Messages['fuel']['pumpVerify'],
): {
  default: PumpVerifyModeCopy
  remote: PumpVerifyModeCopy & { label: string }
  'on-site': PumpVerifyModeCopy
} {
  return {
    default: messages.default,
    remote: messages.remote,
    'on-site': messages.onSite,
  }
}

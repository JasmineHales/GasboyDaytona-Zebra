export const pumpVerifyCopy = {
  default: {
    description: 'Scan or enter the pump number to verify the pump',
    scanLabel: 'Scan Pump',
    scanHint: 'Point at the QR on your pump',
    manualEntryLabel: 'Enter pump number',
  },
  remote: {
    label: 'Remote Unlock',
    description: 'Scan or enter the pump number to unlock in this app',
    scanLabel: 'Scan Pump',
    scanHint: 'Point at the QR on your pump',
    manualEntryLabel: 'Enter pump number',
  },
  'on-site': {
    description: 'After unlocking at the terminal',
    scanLabel: 'Scan Pump',
    scanHint: 'Confirm you are at the correct pump',
    manualEntryLabel: 'Enter pump number',
  },
} as const

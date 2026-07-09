export type VehicleSearchActivityType =
  | 'VSA'
  | 'Transporter'
  | 'Fuel'
  | 'Car Wash'
  | 'Stall Move'
  | 'Transport Move'
  | 'Non-Driving Activity'

export type SelectedVehicle = {
  vehicleId: string
  licensePlate: string
  vin: string
  unitNumber: string
  owningArea: string
  make: string
  model: string
  year: number
  color: string
  state: string
}

export type VehicleSearchProps = {
  activityType: VehicleSearchActivityType
  locationId?: string
  userId?: string
  onVehicleSelected: (vehicle: SelectedVehicle) => void
  onCancel?: () => void
  devPreviewState?: string | null
  site?: string
}

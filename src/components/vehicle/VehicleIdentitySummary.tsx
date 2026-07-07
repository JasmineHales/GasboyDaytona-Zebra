export type VehicleIdentityFields = {
  licensePlate: string
  make: string
  model: string
  vehicleType: string
  vin: string
  color: string
  state: string
}

type VehicleIdentitySummaryProps = VehicleIdentityFields & {
  className?: string
}

export function VehicleIdentitySummary({
  licensePlate,
  make,
  model,
  vehicleType,
  vin,
  color,
  state,
  className = '',
}: VehicleIdentitySummaryProps) {
  return (
    <div className={`vehicle-identity${className ? ` ${className}` : ''}`}>
      <p className="vehicle-identity__title">{licensePlate}</p>
      <div className="vehicle-identity__details">
        <p className="vehicle-identity__line vehicle-identity__line--primary">
          {make} · {model} · {vehicleType}
        </p>
        {vin ? (
          <p className="vehicle-identity__line vehicle-identity__line--vin">{vin}</p>
        ) : null}
        <p className="vehicle-identity__line">
          {color} · {state}
        </p>
      </div>
    </div>
  )
}

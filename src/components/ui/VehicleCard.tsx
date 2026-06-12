import { ChevronDown, ShoppingCart } from 'lucide-react'

const VEHICLE_NAME = 'GRA Nissan Rogue - 2WD SMALL 5 PASS SUV'

export function VehicleCard() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border-light)] bg-white p-3 shadow-[1px_1px_1.5px_rgba(45,47,49,0.1)]">
      <ShoppingCart className="h-6 w-6 shrink-0 text-[var(--color-text-primary)]" />
      <p className="flex-1 text-xs font-medium leading-4 text-[#101828]">{VEHICLE_NAME}</p>
      <ChevronDown className="h-6 w-6 shrink-0 text-[var(--color-text-primary)]" />
    </div>
  )
}

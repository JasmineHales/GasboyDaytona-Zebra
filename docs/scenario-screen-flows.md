# Five facilitator scenarios — screen flows

Prototype reference: `flowNavigation.ts`, `screenPresets.ts`, `vehicleSearchCatalog.ts`.

Miro board: [uXjVH_bPrHs](https://miro.com/app/board/uXjVH_bPrHs=/?moveToWidget=3458764677280818091)

## Scenario index

| # | Facilitator task | Plate | VIN | Home action |
|---|------------------|-------|-----|-------------|
| 1 | Transport + remote fuel (Miami AP) | DNJ 0955 | 5YJ3E1EA1KF654321 | **Transport** |
| 2 | Stall movement + fuel recovery | BC18351 | 5NPE34AF4HH123789 | **Transport** |
| 3 | Clean only (vehicle on hold) | 8LAK631 | 1C4NJCEB4HD123456 | **VSA** |
| 4 | Clean + fuel + stall issue | V576AE | 1FM5K8D83HGA98765 | **VSA** |
| 5 | Fuel only + unlock timeout | 215BG2 | 3VW2B7AJ5HM567890 | **Fuel** |

## Shared entry (all scenarios)

| Step | Screen / state | Notes |
|------|----------------|-------|
| 1 | `home-work` | Work tab |
| 2 | Tap **Transport**, **VSA**, or **Fuel** | Sets `vehicleSearchWorkflow` |
| 3 | Vehicle search | idle → type/scan → results → select |
| 4 | **Hold confirm** (if on-hold) | 8LAK631 (scenario 3), 215BG2 (scenario 5) |
| 5 | Workflow shell | `transport-default` · `stall-default` · `fueling-default` |
| 6 | Odometer on vehicle card | Trusted **or** manual (`odometer-manual-*`) |
| 7 | Section accordion | Movement · Cleaning · Fuel · Stall |
| 8 | Per-section **Complete** | Acknowledges section |
| 9 | Footer **Complete** | Returns `home-work` |

---

## Scenario 1 — DNJ 0955 · Transport + remote fuel

**Facilitator:** Move to **Miami AP**, unlock pump, refuel, continue move.

### Odometer
| Screen | Condition |
|--------|-----------|
| `odometer-manual-filled` | Stale telematics — enter reading |

### Screen sequence

```
home-work
  → vehicle-search · DNJ 0955
  → transport-default
  → odometer manual entry
  → movement-transport-select-location (Miami AP)
  → movement-transport-location-selected
  → movement-transport-complete
  → fueling-default → unlocking → in-progress
  → fueling-complete (auto ~20s · 5 gal)
  → footer Complete → home-work
```

---

## Scenario 2 — BC18351 · Stall + fuel recovery

**Facilitator event:** Once refuelling started, say *"The fuelling has stopped unexpectedly. The vehicle still needs fuel."* No further guidance.

### Odometer
| Screen | Condition |
|--------|-----------|
| `odometer-verified` | Trusted mileage |

### Screen sequence

```
home-work
  → vehicle-search · BC18351
  → transport-default
  → movement-stall-select-stall (Stall 3)
  → movement-stall-selected → movement-stall-verify
  → fueling-default → unlocking → in-progress
  → fueling-complete (pump stop ~12s · 3 gal)
  → fueling-issue → fueling-additional → fueling-additional-complete
  → footer Complete → home-work
```

---

## Scenario 3 — 8LAK631 · Clean only (hold)

**Facilitator note:** If odometer requested, provide prepared mileage.

### Screen sequence

```
home-work
  → vehicle-search · 8LAK631
  → vehicle-search · hold confirm
  → stall-default (VSA)
  → odometer manual entry
  → cleaning-default → cleaning-in-progress → cleaning-complete
  → footer Complete → home-work
```

### Do not visit
Any `fueling-*` or `movement-transport-*` screen.

---

## Scenario 4 — V576AE · Clean + fuel + stall

**Facilitator event:** After stall assigned, say *"There is an issue with the assigned stall."*

### Screen sequence

```
home-work
  → vehicle-search · V576AE
  → stall-default
  → odometer manual entry
  → cleaning-default → cleaning-in-progress → cleaning-complete
  → fueling-default → unlocking → in-progress (no pump telemetry)
  → fueling-complete (manual complete)
  → stall-missing → stall-issue-reported → stall-complete
  → footer Complete → home-work
```

---

## Scenario 5 — 215BG2 · Fuel only + unlock timeout

**Facilitator event:** On unlock attempt, say *"The remote fuel request has timed out and the pump remains locked."*

### Odometer
| Screen | Condition |
|--------|-----------|
| `odometer-verified` | Trusted mileage |

### Screen sequence

```
home-work
  → vehicle-search · 215BG2
  → vehicle-search · hold confirm (Customer extension)
  → fueling-default
  → fueling-unlocking
  → fueling-pump-timeout (~15s)
  → Retry unlock OR change pump OR report issue
```

---

## Screen ID quick reference

### Movement (Transport)
`transport-default` · `movement-transport-*` · `movement-stall-*`

### VSA cleaning / stall
`stall-default` · `cleaning-*` · `stall-missing` · `stall-issue-reported` · `stall-complete` · `vsa-complete`

### Fuel · remote Gasboy
`fueling-default` · `fueling-unlocking` · `fueling-in-progress` · `fueling-complete` · `fueling-additional*` · `fueling-pump-timeout` · `fueling-issue`

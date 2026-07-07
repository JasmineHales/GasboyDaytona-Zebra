# Daytona — Stakeholder workflow flow diagrams

Source of truth: `workflowProgress.ts`, `flowNavigation.ts`, `progress.ts`, `TransportScreen`, `VsaScreen`.

**How to use in Miro:** Board [uXjVHAsM1OU](https://miro.com/app/board/uXjVHAsM1OU=/) → Insert → Diagram / paste Mermaid blocks below into frames.

---

## 1. Entry (all workflows)

```mermaid
flowchart TD
  HOME[Home] --> SEARCH[Vehicle Search]
  SEARCH -->|Cancel| HOME
  SEARCH -->|Hold on vehicle| HOLD{Confirm continue?}
  HOLD -->|No| SEARCH
  HOLD -->|Yes| PICK{Workflow}
  PICK -->|Transport| TR[Transport · Movement + Fuel]
  PICK -->|VSA| VSA[VSA · Cleaning + Fuel + optional Stall]
  PICK -->|Fuel| FO[Fuel-only · Fuel section only]

  TR --> CARD[Vehicle card + Odometer]
  VSA --> CARD
  FO --> CARD

  CARD -->|Trusted mileage| SEC[Sections accordion]
  CARD -->|Manual / out of date| ODO[Enter odometer]
  ODO --> SEC

  SEC --> ACK[Per-section Complete acknowledges section]
  ACK --> FIN[Footer Complete · finish workflow]
```

---

## 2. Transport — scenario matrix

**Sections:** Movement (required) · Fuel (optional until started)

| Scenario | Movement mode | Fuel | Finish rule |
|----------|---------------|------|-------------|
| Move only | Transport location | Skip (not started) | Movement acknowledged |
| Move + fuel | Transport location | Full fuel path | Movement + fuel settled |
| Stall only | Stall assignment | Skip | Movement acknowledged |
| Stall + fuel | Stall assignment | Full fuel path | Movement + fuel settled |

```mermaid
flowchart TD
  START[Transport session] --> MOV[Movement section]

  MOV --> MODE{Movement mode}
  MODE -->|Transport location| LOC[Select location]
  LOC --> LOCS[Location selected · confirm]
  LOCS --> MOVC[Movement complete · Fuel unlocks]

  MODE -->|Stall assignment| STSEL[Select stall number]
  STSEL --> STOK{Stall available?}
  STOK -->|Yes| MOVC
  STOK -->|Occupied| STVER[Missing · Verify stall · Take photo]
  STVER --> STISS[Issue reported]
  STISS --> MOVC

  MOVC --> FUELQ{Fuel started?}
  FUELQ -->|No · optional| FIN1[Footer Complete enabled]
  FUELQ -->|Yes| FUEL[Fuel section · see Fuel flows]
  FUEL --> FIN2[Footer Complete when fuel settled]

  FIN1 --> DONE[Workflow finished · Home]
  FIN2 --> DONE
```

**Transport Complete — blocked when:**
- Movement not complete
- Fuel in progress or missing info (once fuel started, cannot skip)
- Odometer unresolved
- Another section still in progress
- Section complete but not yet acknowledged (tap section Complete first)

---

## 3. VSA — scenario matrix

**Sections:** Cleaning + Fuel (parallel, at least one required) · Stall (optional, site toggle)

| Scenario | Cleaning | Fuel | Stall | Finish rule |
|----------|----------|------|-------|-------------|
| Clean only | Complete + ack | Skip | Skip | Cleaning ack |
| Fuel only | Skip | Complete + ack | Skip | Fuel ack |
| Clean + fuel | Both complete + ack | Both | Skip | Both ack if done |
| Clean + stall | Complete + ack | Skip | Complete + ack | Cleaning + stall if used |
| Fuel + stall | Skip | Complete + ack | Complete + ack | Fuel + stall if used |
| Clean + fuel + stall | All used | All | All | All completed sections ack |

```mermaid
flowchart TD
  START[VSA session] --> PAR[Cleaning ∥ Fuel · both Optional chips]

  PAR --> CLEAN[Cleaning path]
  PAR --> FUEL[Fuel path]

  CLEAN --> C1[Enter workstation · scan or type]
  C1 --> C2{Valid workstation?}
  C2 -->|No| CERR[Manual entry error]
  C2 -->|Yes| C3[Workstation ready · Start cleaning]
  C3 --> C4[Cleaning in progress]
  C4 --> CC[Cleaning complete]

  CC --> UNLOCK[Stall section unlocks]
  FUEL --> FC[Fuel complete path]
  FC --> UNLOCK

  UNLOCK --> STQ{Stall enabled at site?}
  STQ -->|No| FIN
  STQ -->|Yes · optional| STALL[Stall section]
  STALL --> ST1[Select stall]
  ST1 --> ST2{Available?}
  ST2 -->|Yes| STC[Stall complete]
  ST2 -->|Occupied| STV[Verify stall · photo]
  STV --> STI[Issue reported]
  STI --> STC

  STC --> FIN
  CC --> FIN
  FC --> FIN

  FIN{At least Cleaning OR Fuel acknowledged?}
  FIN -->|No| BLOCK[Complete disabled · Finish Cleaning or Fuel]
  FIN -->|Yes| DONE[Footer Complete · Home]
```

**Stall lock:** Stall accordion disabled until Cleaning **or** Fuel is complete — not while either is in progress.

**VSA parallel rule:** Completing/acknowledging Cleaning does **not** require Fuel to be idle (and vice versa).

---

## 4. Fuel — shared flow (Transport · VSA · Fuel-only)

Three unlock modes (site/pump):

```mermaid
flowchart TD
  F0[Enter pump number] --> F0B{Scan or manual?}
  F0B --> SCAN[Scanner overlay]
  F0B --> MAN[Manual entry]
  SCAN --> F1[Pump confirmed]

  F1 --> MODE{Unlock mode}

  MODE -->|Unlock with device · Gasboy| R1[Turning on pump]
  R1 --> R2{Pump response?}
  R2 -->|OK| R3[Pump unlocked · 60s pickup window]
  R2 -->|Connection lost| E1[Error · Retry unlock / Change pump]
  R2 -->|No response 15s| E2[Error · Retry / Change pump / Complete if unlocked]
  R2 -->|Timeout| E3[Error · Pump timeout]
  R2 -->|Unavailable| E4[Error · Pump unavailable · Change pump]
  R3 --> R4[Fueling in progress]
  R4 --> R5[Gallons captured · OCR / manual]
  R5 --> RC[Fuel complete]

  MODE -->|Unlock at pump · Gasboy| O1[At pump · verified]
  O1 --> O2[Fueling in progress · manual gallons]
  O2 --> O3{Gallons entered?}
  O3 -->|No| OM[Missing gallons warning]
  O3 -->|Yes| RC

  MODE -->|Non-Gasboy| N1[At pump · verified]
  N1 --> N2[Manual fueling + gallons]
  N2 --> RC

  RC --> ADD{Additional fueling?}
  ADD -->|Yes| F0
  ADD -->|No| ACK[Fuel section Complete]

  E1 --> ISSUE[Report issue overlay]
  E2 --> ISSUE
  ISSUE --> CAT[Category → Details · photo / voice]
  CAT --> SUB[Submit · may allow finish if prior txn complete]
```

**Transport fuel optional:** If operator never opens Fuel, footer Complete after Movement only.

**Transport fuel started:** Footer Complete blocked until fuel completes, errors resolve, or issue-report completion path applies.

---

## 5. Error & recovery summary

| Area | State | Operator action | Complete impact |
|------|-------|-----------------|-----------------|
| Odometer | Trusted | Auto-filled | — |
| Odometer | Manual required | Enter reading | Blocked until valid |
| Odometer | Below floor | Validation error | Blocked |
| Movement stall | Occupied | Photo → issue reported | Movement can complete |
| VSA stall | Occupied | Photo → issue reported | Stall can complete |
| Fuel remote | Connection lost | Retry / change pump | Blocked while unlocking |
| Fuel remote | No response | Retry / change / complete if unlocked | Uncertain unlock path |
| Fuel remote | Timeout | Change pump | Blocked |
| Fuel remote | Unavailable | Change pump | Blocked |
| Fuel on-site | Missing gallons | Enter gallons | Blocked until filled |
| Cleaning | Invalid workstation | Re-enter | Blocked at verify |
| Issue | Any workflow | Header or section report | Overlay; fuel issue may allow finish |
| Hold | Vehicle search | Confirm dialog | — |

---

## 6. Footer Complete decision tree

```mermaid
flowchart TD
  TAP[Tap Footer Complete] --> BLK{Blocking in-progress / missing?}
  BLK -->|Yes| EXP[Expand blocking section · show reason]
  BLK -->|No| ACK{Section waiting acknowledge?}
  ACK -->|Yes| SECC[Tap that section Complete first]
  ACK -->|No| ODO{Odometer resolved?}
  ODO -->|No| ODOE[Scroll to odometer · enter reading]
  ODO -->|No| READY{Workflow ready?}
  ODO -->|Yes| READY
  READY -->|Transport · movement incomplete| MOV[Finish Movement message]
  READY -->|VSA · neither core service done| CORE[Finish Cleaning or Fuel message]
  READY -->|Yes| FINISH[Finish workflow → Home]
```

---

## 7. Tutorial mode (does not affect production flow)

Guided tour only: UI locked, no workflow persistence, no click tracking, state restored on skip/finish.

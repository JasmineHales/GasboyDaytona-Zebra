import { Barcode, ScanLine, ScanQrCode, Search } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { useCameraCapture } from '../../hooks/useCameraCapture'
import type { VehicleSearchProps } from '../../types/vehicleSearch'
import { parseVehicleFromBarcode, parseVehicleFromQr } from '../../utils/parseVehicleScan'
import { slugifyTrackValue, trackProps } from '../../utils/tracking'
import {
  EMPTY_VEHICLE_SEARCH_FILTERS,
  resolveVehicleFromScanValue,
  searchVehicleCatalog,
  toSelectedVehicle,
  VEHICLE_SEARCH_CATALOG,
  type VehicleCatalogEntry,
} from '../../utils/vehicleSearchCatalog'
import { revokeLicensePlateImageUri, warmLicensePlateOcrWorker } from '../../utils/readLicensePlateFromPhoto'
import { getVehicleSearchActivityConfig } from '../../utils/vehicleSearchActivity'
import { isPriorityVehicleClass } from '../../utils/homePriorityCarGroups'
import { ScannerScreen } from '../fuel/ScannerScreen'
import { Header } from '../ui/Header'
import { TextField } from '../ui/TextField'
import { VehiclePlateScannerScreen } from './VehiclePlateScannerScreen'
import { VehicleSearchManualEntryOverlay } from './VehicleSearchManualEntryOverlay'
import { VehicleSearchResultCard } from './VehicleSearchResultCard'
import {
  EMPTY_MANUAL_VEHICLE_ENTRY,
  manualEntryToCatalogEntry,
  type ManualVehicleEntry,
} from '../../utils/vehicleSearchManualEntry'
import { VehicleHoldConfirmDialog } from './VehicleHoldConfirmDialog'
import {
  resolveVehicleHoldWarningForConfirm,
  vehicleEntryRequiresHoldConfirmation,
  type VehicleSearchHoldWarning,
} from '../../utils/vehicleSearchResultDisplay'
import {
  buildVehicleSearchDevSnapshot,
  isVehicleSearchDevStateId,
} from '../../utils/vehicleSearchDevStates'

type ScannerMode = 'plate' | 'qr' | 'barcode'

function VehicleSelectList({
  vehicles,
  selectedVehicleId,
  expandedVehicleId,
  radioGroupName,
  onSelectVehicle,
  onToggleExpand,
  query,
  hasActiveSearch,
  onManualEntry,
  manualEntryLabel,
}: {
  vehicles: VehicleCatalogEntry[]
  selectedVehicleId: string | null
  expandedVehicleId: string | null
  radioGroupName: string
  onSelectVehicle: (vehicleId: string) => void
  onToggleExpand: (vehicleId: string) => void
  query: string
  hasActiveSearch: boolean
  onManualEntry: () => void
  manualEntryLabel: string
}) {
  const { messages, t } = useI18n()
  const copy = messages.vehicleSearch

  if (!hasActiveSearch) {
    return (
      <p className="vehicle-search-idle-hint" role="status">
        {copy.searchIdleHint}
      </p>
    )
  }

  if (vehicles.length === 0) {
    const trimmedQuery = query.trim()
    return (
      <div className="vehicle-search-empty" role="status">
        <p className="vehicle-search-empty__title">{copy.noResultsTitle}</p>
        <p className="vehicle-search-empty__hint">
          {trimmedQuery
            ? t('vehicleSearch.noResultsHint', { query: trimmedQuery })
            : copy.noResults}
        </p>
        <button
          type="button"
          className="vehicle-search-manual-entry-link"
          onClick={onManualEntry}
          {...trackProps('vehicle-search.manual-entry.open', { source: 'empty-state' })}
        >
          {manualEntryLabel}
        </button>
      </div>
    )
  }

  return (
    <ul className="vehicle-search-list" role="radiogroup" aria-label={copy.selectVehicle}>
      {vehicles.map((vehicle) => {
        const selected = selectedVehicleId === vehicle.vehicleId
        const expanded = expandedVehicleId === vehicle.vehicleId

        return (
          <li
            key={vehicle.vehicleId}
            className={`vehicle-search-list__item${
              selected ? ' vehicle-search-list__item--selected' : ''
            }${expanded ? ' vehicle-search-list__item--expanded' : ''}`}
          >
            <VehicleSearchResultCard
              vehicle={vehicle}
              selected={selected}
              expanded={expanded}
              radioName={radioGroupName}
              onSelect={() => onSelectVehicle(vehicle.vehicleId)}
              onToggleExpand={() => onToggleExpand(vehicle.vehicleId)}
            />
          </li>
        )
      })}
    </ul>
  )
}

export function VehicleSearch({
  activityType,
  locationId: _locationId,
  userId: _userId,
  site,
  onVehicleSelected,
  onCancel,
  devPreviewState = null,
}: VehicleSearchProps) {
  const { messages, t } = useI18n()
  const copy = messages.vehicleSearch
  const titleId = useId()
  const radioGroupName = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const activity = getVehicleSearchActivityConfig(activityType)

  const [query, setQuery] = useState('')
  const [manualEntryOpen, setManualEntryOpen] = useState(false)
  const [manualEntry, setManualEntry] = useState<ManualVehicleEntry>(EMPTY_MANUAL_VEHICLE_ENTRY)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [expandedVehicleId, setExpandedVehicleId] = useState<string | null>(null)
  const [scannerMode, setScannerMode] = useState<ScannerMode | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  const [capturedPlateFile, setCapturedPlateFile] = useState<File | null>(null)
  const [plateCaptureSession, setPlateCaptureSession] = useState(0)
  const [pendingHoldWarning, setPendingHoldWarning] = useState<VehicleSearchHoldWarning | null>(
    null,
  )
  const [pendingHoldEntry, setPendingHoldEntry] = useState<VehicleCatalogEntry | null>(null)

  useEffect(() => {
    warmLicensePlateOcrWorker()
  }, [])

  const dismissSearchFocus = useCallback(() => {
    searchInputRef.current?.blur()
  }, [])

  const handlePointerDownOutsideSearch = (event: React.PointerEvent<HTMLElement>) => {
    const target = event.target as HTMLElement
    if (target.closest('.vehicle-search-toolbar-section')) return
    if (target.closest('.em45-android-keyboard')) return
    if (target.closest('.vehicle-search-footer')) return
    dismissSearchFocus()
  }

  useEffect(() => {
    if (!devPreviewState || !isVehicleSearchDevStateId(devPreviewState)) return

    const snapshot = buildVehicleSearchDevSnapshot(devPreviewState, copy.scanNotFound)
    setQuery(snapshot.query)
    setScanError(snapshot.scanError)
    setManualEntryOpen(snapshot.manualEntryOpen)
    setManualEntry(snapshot.manualEntry)
    setSelectedVehicleId(snapshot.selectedVehicleId)
    setExpandedVehicleId(snapshot.selectedVehicleId)
    setScannerMode(null)
    setCapturedPlateFile(null)

    if (snapshot.holdConfirmOpen) {
      const holdVehicle =
        VEHICLE_SEARCH_CATALOG.find((entry) => entry.licensePlate === '8LAK631') ??
        VEHICLE_SEARCH_CATALOG.find((entry) => entry.alertKind === 'on-hold') ??
        VEHICLE_SEARCH_CATALOG[0] ??
        null
      if (holdVehicle) {
        setPendingHoldEntry(holdVehicle)
        setPendingHoldWarning(resolveVehicleHoldWarningForConfirm(holdVehicle))
      }
    } else {
      setPendingHoldEntry(null)
      setPendingHoldWarning(null)
    }
  }, [copy.scanNotFound, devPreviewState])

  const closePlateScanner = useCallback(() => {
    setCapturedPlateFile(null)
    setScannerMode(null)
  }, [])

  const handlePlatePhotoSelected = useCallback((file: File) => {
    setScanError(null)
    setCapturedPlateFile(file)
    setPlateCaptureSession((session) => session + 1)
  }, [])

  const { openCamera, inputRef, handleInputChange } = useCameraCapture({
    onCapture: handlePlatePhotoSelected,
    onCancel: closePlateScanner,
  })

  const hasActiveSearch = query.trim().length > 0

  const results = useMemo(() => {
    if (!hasActiveSearch) return []

    const matches = searchVehicleCatalog(query, EMPTY_VEHICLE_SEARCH_FILTERS)
    if (!site) return matches

    return [...matches].sort((a, b) => {
      const aPriority = isPriorityVehicleClass(a.vehicleClass, site)
      const bPriority = isPriorityVehicleClass(b.vehicleClass, site)
      if (aPriority === bPriority) return 0
      return aPriority ? -1 : 1
    })
  }, [query, site, hasActiveSearch])

  const headerTitle = copy.titles[activity.titleKey] ?? copy.findVehicle
  const badgeLabel = copy.badges[activity.badgeKey] ?? activityType.toUpperCase()
  const confirmLabel = copy[activity.confirmLabelKey]

  const completeVehicleSelection = (entry: VehicleCatalogEntry) => {
    setScanError(null)
    onVehicleSelected(toSelectedVehicle(entry))
  }

  const openHoldConfirmForEntry = (entry: VehicleCatalogEntry) => {
    setPendingHoldEntry(entry)
    setPendingHoldWarning(resolveVehicleHoldWarningForConfirm(entry))
  }

  const attemptVehicleSelection = (entry: VehicleCatalogEntry) => {
    if (vehicleEntryRequiresHoldConfirmation(entry)) {
      openHoldConfirmForEntry(entry)
      return
    }
    completeVehicleSelection(entry)
  }

  const handleHoldConfirmContinue = () => {
    if (!pendingHoldEntry) return
    const entry = pendingHoldEntry
    setPendingHoldEntry(null)
    setPendingHoldWarning(null)
    completeVehicleSelection(entry)
  }

  const handleHoldConfirmCancel = () => {
    setPendingHoldEntry(null)
    setPendingHoldWarning(null)
    setSelectedVehicleId(null)
  }

  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId)
    setPendingHoldEntry(null)
    setPendingHoldWarning(null)
  }

  const handleToggleExpand = (vehicleId: string) => {
    setExpandedVehicleId((current) => (current === vehicleId ? null : vehicleId))
  }

  const handleContinueFromSearch = () => {
    const entry = results.find((vehicle) => vehicle.vehicleId === selectedVehicleId)
    if (!entry) return
    attemptVehicleSelection(entry)
  }

  const selectedSearchEntry =
    results.find((vehicle) => vehicle.vehicleId === selectedVehicleId) ?? null

  const resolveScannedVehicle = (value: string) => {
    return (
      resolveVehicleFromScanValue(value) ??
      searchVehicleCatalog(value, EMPTY_VEHICLE_SEARCH_FILTERS)[0] ??
      null
    )
  }

  const handleScanComplete = (value: string) => {
    setScannerMode(null)
    const match = resolveScannedVehicle(value)
    if (match) {
      attemptVehicleSelection(match)
      return
    }

    setScanError(copy.scanNotFound)
    setQuery(value)
  }

  const handlePlateScanConfirm = (payload: { plate: string; imageUri: string }) => {
    revokeLicensePlateImageUri(payload.imageUri)
    closePlateScanner()
    handleScanComplete(payload.plate)
  }

  const handleBack = () => {
    onCancel?.()
  }

  useEffect(() => {
    if (!hasActiveSearch) {
      setSelectedVehicleId(null)
      setExpandedVehicleId(null)
    }
  }, [hasActiveSearch])

  useEffect(() => {
    if (results.length === 1) {
      setSelectedVehicleId(results[0].vehicleId)
      setPendingHoldEntry(null)
      setPendingHoldWarning(null)
      return
    }

    if (
      selectedVehicleId &&
      !results.some((vehicle) => vehicle.vehicleId === selectedVehicleId)
    ) {
      setSelectedVehicleId(null)
      setExpandedVehicleId(null)
      setPendingHoldEntry(null)
      setPendingHoldWarning(null)
    }
  }, [results, selectedVehicleId])

  const openManualEntry = () => {
    setManualEntry(EMPTY_MANUAL_VEHICLE_ENTRY)
    setManualEntryOpen(true)
  }

  const submitManualEntry = () => {
    const entry = manualEntryToCatalogEntry(manualEntry)
    setManualEntryOpen(false)
    attemptVehicleSelection(entry)
  }

  const openPlateScan = () => {
    setScanError(null)
    setScannerMode('plate')
    window.requestAnimationFrame(() => {
      openCamera()
    })
  }

  const requestPlateRetake = () => {
    setCapturedPlateFile(null)
    openCamera()
  }

  if (scannerMode === 'plate' && capturedPlateFile) {
    return (
      <VehiclePlateScannerScreen
        key={plateCaptureSession}
        file={capturedPlateFile}
        onBack={closePlateScanner}
        onRequestRetake={requestPlateRetake}
        onConfirm={handlePlateScanConfirm}
        trackPrefix="vehicle-search.scan.plate"
      />
    )
  }

  if (scannerMode === 'qr' || scannerMode === 'barcode') {
    const scannerCopy =
      scannerMode === 'barcode'
        ? { title: copy.scanBarcode, hint: copy.scanBarcodeHint }
        : { title: copy.scanQr, hint: copy.scanQrHint }

    return (
      <ScannerScreen
        title={scannerCopy.title}
        hint={scannerCopy.hint}
        manualEntryDescription={copy.searchVehicles}
        scanFormat={scannerMode === 'barcode' ? 'barcode' : 'qr'}
        parseResult={scannerMode === 'barcode' ? parseVehicleFromBarcode : parseVehicleFromQr}
        onBack={() => setScannerMode(null)}
        onManualEntry={() => {
          setScannerMode(null)
        }}
        onScanComplete={handleScanComplete}
        trackPrefix={`vehicle-search.scan.${scannerMode}`}
      />
    )
  }

  const showResultsList = hasActiveSearch && results.length > 0 && !scanError
  const useResultsLayout = !scanError

  const searchField = (
    <div className="vehicle-search-toolbar">
      <label className="fleet-field__label vehicle-search-toolbar__label" htmlFor="vehicle-search-query">
        {copy.searchVehicles}
      </label>
      <TextField
        id="vehicle-search-query"
        className="vehicle-search-toolbar__search"
        inputRef={searchInputRef}
        value={query}
        error={scanError ?? undefined}
        invalid={Boolean(scanError)}
        onChange={(value) => {
          setScanError(null)
          setQuery(value)
        }}
        placeholder={copy.searchPlaceholder}
        inputMode="search"
        startIcon={Search}
        onClear={() => {
          setScanError(null)
          setQuery('')
        }}
        clearTrackTag="vehicle-search.search-clear"
        autoComplete="off"
      />
    </div>
  )

  const searchToolbarSection = (
    <>
      <p id={titleId} className="fleet-sr-only">
        {headerTitle}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="fleet-sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleInputChange}
      />
      <div className="vehicle-search-scan-row">
        <button
          type="button"
          className="vehicle-search-scan-action vehicle-search-scan-action--primary"
          aria-label={`${copy.scanQr}. ${messages.issue.scanVehicleShortHint}`}
          onClick={() => {
            setScanError(null)
            setScannerMode('qr')
          }}
          {...trackProps('vehicle-search.scan.qr.open')}
        >
          <ScanQrCode className="vehicle-search-scan-action__icon" aria-hidden />
          <span className="vehicle-search-scan-action__label">{copy.scanQr}</span>
        </button>
        <button
          type="button"
          className="vehicle-search-scan-action"
          aria-label={copy.scanPlate}
          onClick={openPlateScan}
          {...trackProps('vehicle-search.scan.plate.open')}
        >
          <ScanLine className="vehicle-search-scan-action__icon" aria-hidden />
          <span className="vehicle-search-scan-action__label">{copy.scanPlate}</span>
        </button>
        <button
          type="button"
          className="vehicle-search-scan-action"
          aria-label={copy.scanBarcode}
          onClick={() => {
            setScanError(null)
            setScannerMode('barcode')
          }}
          {...trackProps('vehicle-search.scan.barcode.open')}
        >
          <Barcode className="vehicle-search-scan-action__icon" aria-hidden />
          <span className="vehicle-search-scan-action__label">{copy.scanBarcode}</span>
        </button>
      </div>

      <p className="vehicle-search-or">{t('common.or')}</p>

      {searchField}
    </>
  )

  const resultsSection = !scanError ? (
    <>
      <VehicleSelectList
        vehicles={results}
        selectedVehicleId={selectedVehicleId}
        expandedVehicleId={expandedVehicleId}
        radioGroupName={radioGroupName}
        onSelectVehicle={handleSelectVehicle}
        onToggleExpand={handleToggleExpand}
        query={query}
        hasActiveSearch={hasActiveSearch}
        onManualEntry={openManualEntry}
        manualEntryLabel={copy.manualEntry.link}
      />
      {!hasActiveSearch || results.length > 0 ? (
        <button
          type="button"
          className="vehicle-search-manual-entry-link vehicle-search-manual-entry-link--footer"
          onClick={openManualEntry}
          {...trackProps('vehicle-search.manual-entry.open', {
            source: hasActiveSearch ? 'search-results' : 'idle',
          })}
        >
          {copy.manualEntry.link}
        </button>
      ) : null}
    </>
  ) : (
    <button
      type="button"
      className="vehicle-search-manual-entry-link"
      onClick={openManualEntry}
      {...trackProps('vehicle-search.manual-entry.open', { source: 'scan-error' })}
    >
      {copy.manualEntry.link}
    </button>
  )

  return (
    <div
      className={`vehicle-search-screen app-surface relative flex min-h-0 w-full flex-1 flex-col${
        showResultsList ? ' vehicle-search-screen--with-footer' : ''
      }`}
      onPointerDown={handlePointerDownOutsideSearch}
    >
      <Header
        title={headerTitle}
        subtitle={badgeLabel}
        showBack
        showSessionTimer={false}
        confirmOnExit={Boolean(selectedSearchEntry)}
        onBack={handleBack}
      />

      <main
        id="main-content"
        className={`app-workflow-main vehicle-search-main min-h-0 flex-1${
          useResultsLayout
            ? ' vehicle-search-main--results'
            : ' vehicle-search-main--browse app-scroll py-2'
        }`}
      >
        <div
          className={`vehicle-search-toolbar-section${
            hasActiveSearch ? ' vehicle-search-toolbar-section--typing' : ''
          }`}
        >
          {searchToolbarSection}
        </div>
        <div className="vehicle-search-results-scroll app-scroll">{resultsSection}</div>
      </main>

      {hasActiveSearch && results.length > 0 ? (
        <footer className="vehicle-search-footer">
          <p className="vehicle-search-footer__status">
            {selectedSearchEntry
              ? copy.results.oneVehicleSelected
              : copy.results.noVehicleSelected}
          </p>
          <button
            type="button"
            className="fleet-btn fleet-btn-contained-brand vehicle-search-footer__continue"
            disabled={!selectedSearchEntry}
            onClick={handleContinueFromSearch}
            {...trackProps('vehicle-search.continue', {
              unit: selectedSearchEntry
                ? slugifyTrackValue(selectedSearchEntry.unitNumber)
                : 'none',
            })}
          >
            {copy.continue}
          </button>
        </footer>
      ) : null}

      <VehicleSearchManualEntryOverlay
        open={manualEntryOpen}
        entry={manualEntry}
        submitLabel={confirmLabel}
        onChange={setManualEntry}
        onClose={() => setManualEntryOpen(false)}
        onSubmit={submitManualEntry}
      />

      {pendingHoldWarning ? (
        <VehicleHoldConfirmDialog
          open={Boolean(pendingHoldWarning)}
          holdWarning={pendingHoldWarning}
          onContinue={handleHoldConfirmContinue}
          onCancel={handleHoldConfirmCancel}
        />
      ) : null}
    </div>
  )
}

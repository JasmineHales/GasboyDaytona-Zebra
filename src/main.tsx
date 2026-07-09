import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { I18nProvider } from './i18n/I18nProvider'
import { ThemeProvider } from './theme/ThemeProvider'
import { patchForOdometerWidgetState } from './utils/devPanel'
import { WIDGET_STATE_GROUPS } from './utils/flowNavigation'
import { MILEAGE_SCENARIO_IDS } from './utils/mileageScenarios'
import {
  buildFlowContextForScreen,
  SCREEN_PRESETS,
} from './utils/screenPresets'
import { VEHICLE_SEARCH_DEV_GROUPS } from './utils/vehicleSearchDevStates'
import './index.css'

if (import.meta.env.DEV) {
  ;(window as Window & { __REMOTE_OFF_CAPTURE__?: unknown }).__REMOTE_OFF_CAPTURE__ = {
    buildFlowContextForScreen,
    SCREEN_PRESETS,
    patchForOdometerWidgetState,
    WIDGET_STATE_GROUPS,
    VEHICLE_SEARCH_DEV_GROUPS,
    MILEAGE_SCENARIO_IDS,
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
)

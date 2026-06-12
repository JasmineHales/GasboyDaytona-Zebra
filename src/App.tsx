import { useState } from 'react'
import { FlowNavigator } from './components/FlowNavigator'
import { HomePage } from './components/HomePage'
import { TransportScreen } from './components/TransportScreen'
import { VsaScreen } from './components/VsaScreen'
import { IssueOverlay } from './components/fuel/IssueOverlay'
import { useFlow } from './hooks/useFlow'

type AppView = 'home' | 'vsa' | 'transport'

export default function App() {
  const [view, setView] = useState<AppView>('home')
  const {
    context,
    goToScreen,
    handleAction,
    handleMovementAction,
    handleStallAction,
    handleCleaningAction,
  } = useFlow()

  const handleFlowAction = (action: string, payload?: string) => {
    if (action === 'back') {
      setView('home')
      return
    }
    handleAction(action, payload)
  }

  return (
    <div className="app-viewport flex h-dvh min-h-0">
      {(view === 'transport' || view === 'vsa') && (
        <FlowNavigator current={context.screen} onSelect={goToScreen} />
      )}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#e8eaed] p-0 sm:p-3 md:p-4 lg:p-6">
        <div className="app-shell relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white sm:max-w-xl sm:rounded-xl sm:shadow-lg md:max-w-2xl md:rounded-2xl lg:max-w-3xl xl:max-w-4xl">
          {view === 'home' && (
            <HomePage
              onSelectVsa={() => {
                goToScreen('stall-default')
                setView('vsa')
              }}
              onSelectTransport={() => {
                goToScreen('transport-default')
                setView('transport')
              }}
              onReportIssue={() => handleAction('report-issue')}
              onSignOut={() => {}}
            />
          )}
          {view === 'vsa' && (
            <VsaScreen
              key="vsa"
              context={context}
              onAction={handleFlowAction}
              onMovementAction={handleMovementAction}
              onStallAction={handleStallAction}
              onCleaningAction={handleCleaningAction}
            />
          )}
          {view === 'transport' && (
            <TransportScreen
              key="transport"
              sections={['movement', 'fuel']}
              defaultExpanded="movement"
              context={context}
              onAction={handleFlowAction}
              onMovementAction={handleMovementAction}
              onStallAction={handleStallAction}
              onCleaningAction={handleCleaningAction}
            />
          )}
          {context.showIssueOverlay && (
            <IssueOverlay
              defaultPumpNumber={context.pumpNumber}
              source={context.issueReportSource === 'fuel' ? 'fuel' : 'header'}
              onClose={() => handleAction('close-issue')}
              onComplete={() => {
                if (context.issueReportSource === 'fuel') {
                  handleAction('submit-issue')
                } else {
                  handleAction('close-issue')
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

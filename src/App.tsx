import { FlowNavigator } from './components/FlowNavigator'
import { TransportScreen } from './components/TransportScreen'
import { useFlow } from './hooks/useFlow'

export default function App() {
  const { context, goToScreen, handleAction, handleMovementAction } = useFlow()

  return (
    <div className="flex h-full min-h-dvh">
      <FlowNavigator current={context.screen} onSelect={goToScreen} />
      <div className="flex flex-1 items-start justify-center overflow-hidden bg-[#e8eaed] p-0 lg:p-6">
        <div className="h-dvh w-full max-w-[360px] lg:h-[800px] lg:rounded-2xl lg:overflow-hidden lg:shadow-2xl">
          <TransportScreen
            context={context}
            onAction={handleAction}
            onMovementAction={handleMovementAction}
          />
        </div>
      </div>
    </div>
  )
}

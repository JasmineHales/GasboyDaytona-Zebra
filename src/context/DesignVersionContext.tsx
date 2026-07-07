import { createContext, useContext, type ReactNode } from 'react'
import type { DesignVersion } from '../utils/designVersion'

type DesignVersionContextValue = {
  version: DesignVersion
  isV2: boolean
  isV3: boolean
}

const DesignVersionContext = createContext<DesignVersionContextValue>({
  version: 'v2',
  isV2: true,
  isV3: false,
})

export function DesignVersionProvider({
  version,
  children,
}: {
  version: DesignVersion
  children: ReactNode
}) {
  return (
    <DesignVersionContext.Provider
      value={{
        version,
        isV2: version === 'v2',
        isV3: version === 'v3',
      }}
    >
      {children}
    </DesignVersionContext.Provider>
  )
}

export function useDesignVersion() {
  return useContext(DesignVersionContext)
}

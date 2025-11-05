import React from 'react'
import { scan, setOptions } from 'react-scan'

type Props = { children: React.ReactNode }

export function ReactScanProvider({ children }: Props) {
  React.useEffect(() => {
      setOptions({ log: true }) 
      scan()
      // start()
    
  }, [])

  return <>{children}</>
}
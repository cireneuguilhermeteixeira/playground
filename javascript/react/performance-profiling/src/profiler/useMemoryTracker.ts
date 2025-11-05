import * as React from 'react'

type MemorySnapshot = {
  timestamp: number
  // These fields are not standardized across browsers; Chrome only for M89+ behind flag.
  totalJSHeapSize?: number
  usedJSHeapSize?: number
  jsMemoryEstimate?: number
}

export function useMemoryTracker(intervalMs = 2000) {
  const [snapshots, setSnapshots] = React.useState<MemorySnapshot[]>([])

  React.useEffect(() => {
    let timer = window.setInterval(async () => {
      const snapshot: MemorySnapshot = { timestamp: performance.now() }

      // Chrome non-standard: performance.memory
      const anyPerf: any = performance as any
      if (anyPerf && anyPerf.memory) {
        snapshot.totalJSHeapSize = anyPerf.memory.totalJSHeapSize
        snapshot.usedJSHeapSize = anyPerf.memory.usedJSHeapSize
      }

      // Experimental: measureUserAgentSpecificMemory
      // @ts-ignore
      if (performance.measureUserAgentSpecificMemory) {
        try {
          // @ts-ignore
          const res = await performance.measureUserAgentSpecificMemory()
          snapshot.jsMemoryEstimate = res.bytes
        } catch {
          // ignore
        }
      }

      setSnapshots(prev => [...prev.slice(-20), snapshot]) // keep last N
    }, intervalMs)

    return () => window.clearInterval(timer)
  }, [intervalMs])

  return snapshots
}

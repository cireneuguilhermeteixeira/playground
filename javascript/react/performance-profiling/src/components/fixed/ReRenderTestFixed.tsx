import React from 'react'

type ChildProps = {
  value: number
  onClick: () => void
}

const ChildFixed = React.memo(function ChildFixed({ value, onClick }: ChildProps) {
  // This component will ONLY re-render when its props actually change
  return (
    <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
      <p>Child value: {value}</p>
      <button onClick={onClick}>Child action</button>
    </div>
  )
})
ChildFixed.displayName = 'ChildFixed'

export function ReRenderTestFixed() {
  const [count, setCount] = React.useState(0)
  const [unrelated, setUnrelated] = React.useState(0)

  // Stable callback – identity does not change on every parent render
  const handleChildClick = React.useCallback(() => {
    setCount((c) => c + 1)
  }, [])

  const childValue = count

  return (
    <div>
      <h3>ReRenderTestFixed (stable props & callbacks)</h3>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
        <button onClick={() => setCount((c) => c + 1)}>Increment child value</button>
        <button onClick={() => setUnrelated((u) => u + 1)}>Update unrelated state</button>
        <span style={{ fontSize: 12, color: '#555' }}>
          Unrelated: <strong>{unrelated}</strong>
        </span>
      </div>

      <ChildFixed value={childValue} onClick={handleChildClick} />

      <p style={{ color: '#555', fontSize: 12, marginTop: 8 }}>
        With this fixed version, updates to <code>unrelated</code> will re-render the parent but{' '}
        <strong>will NOT re-render</strong> the <code>ChildFixed</code>, since its props
        (<code>value</code> and <code>onClick</code>) stay referentially stable.
        <br />
        Use React DevTools Profiler or React Scan to confirm the reduced render count.
      </p>
    </div>
  )
}

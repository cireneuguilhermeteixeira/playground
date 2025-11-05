import React from 'react'

type ChildProps = {
  data: { value: number }
  onClick: () => void
}

const Child = React.memo(function Child({ data, onClick }: ChildProps) {
  // This component will re-render when props identity changes
  return (
    <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
      <p>Child value: {data.value}</p>
      <button onClick={onClick}>Child action</button>
    </div>
  )
})

export function ReRenderTest() {
  const [count, setCount] = React.useState(0)
  const [optimize, setOptimize] = React.useState(false)

  // BAD: new object/function every render (when optimize=false)
  const dataBad = { value: count }
  const onClickBad = () => setCount(c => c + 1)

  // GOOD: stable references via useMemo/useCallback (when optimize=true)
  const dataGood = React.useMemo(() => ({ value: count }), [count])
  const onClickGood = React.useCallback(() => setCount(c => c + 1), [])

  const data = optimize ? dataGood : dataBad
  const onClick = optimize ? onClickGood : onClickBad

  return (
    <div>
      <h3>ReRenderTest (prop identity)</h3>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
        <button onClick={() => setCount(c => c + 1)}>Increment</button>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={optimize} onChange={e => setOptimize(e.target.checked)} />
          Optimize references (useMemo/useCallback)
        </label>
      </div>
      <Child data={data} onClick={onClick} />
      <p style={{ color: '#555', fontSize: 12, marginTop: 8 }}>
        Uncheck the optimization option and observe the...<em>ReactScan</em> signal re-renders of <code>Child</code> a each change in the parent.
      </p>
    </div>
  )
}

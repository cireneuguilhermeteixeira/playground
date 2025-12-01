import React from 'react';

type CounterProps = {
  initialValue?: number;
};

export function Counter({ initialValue = 0 }: CounterProps) {
  const [count, setCount] = React.useState(initialValue);

  return (
    <div>
      <p>Current Value: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <button onClick={() => setCount(c => c - 1)}>Decrement</button>
    </div>
  );
}
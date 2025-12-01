import React from 'react';
import { fetchGreeting } from '../api/greetingApi';

type AsyncButtonProps = {
  name: string;
};

export function AsyncButton({ name }: AsyncButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const [greeting, setGreeting] = React.useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    try {
      const result = await fetchGreeting(name);
      setGreeting(result);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleClick}>Fetch greeting</button>
      {loading && <p>Loading...</p>}
      {greeting && <p data-testid="greeting">{greeting}</p>}
    </div>
  );
}

import React from 'react';

export function TimerLabel() {
  const [message, setMessage] = React.useState('Waiting...');

  React.useEffect(() => {
    const id = setTimeout(() => {
      setMessage('Time is up!');
    }, 1000);

    return () => clearTimeout(id);
  }, []);

  return <p>{message}</p>;
}

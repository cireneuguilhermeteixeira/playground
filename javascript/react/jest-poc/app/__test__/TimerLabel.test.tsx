import React, { act }  from 'react';
import { render, screen } from '@testing-library/react';
import { TimerLabel } from '../components/TimerLabel';

describe('<TimerLabel />', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('uses act with fake timers to drive the timeout and update the state', () => {
    render(<TimerLabel />);

    expect(screen.getByText('Waiting...')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Time is up!')).toBeInTheDocument();
  });
});

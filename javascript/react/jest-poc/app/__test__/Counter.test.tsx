import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Counter } from '../components/Counter';

describe('<Counter />', () => {
  it('shows the initial value using getByText (synchronous)', () => {
    render(<Counter initialValue={10} />);

    const label = screen.getByText(/Current value: 10/i);
    expect(label).toBeInTheDocument();
  });

  it('increments the value when Increment button is clicked', () => {
    render(<Counter initialValue={0} />);

    const incrementButton = screen.getByText('Increment');
    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);

    expect(screen.getByText(/Current value: 2/i)).toBeInTheDocument();
  });

  it('decrements the value when Decrement button is clicked', () => {
    render(<Counter initialValue={5} />);

    const decrementButton = screen.getByText('Decrement');
    fireEvent.click(decrementButton);

    expect(screen.getByText(/Current value: 4/i)).toBeInTheDocument();
  });
});

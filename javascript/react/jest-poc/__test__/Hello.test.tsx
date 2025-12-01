// src/components/__tests__/Hello.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Hello } from '../app/components/Hello';

describe('<Hello />', () => {
  it('renders the name', () => {
    render(<Hello name="User" />);

    expect(screen.getByText('Hello, User!')).toBeInTheDocument();
  });
});

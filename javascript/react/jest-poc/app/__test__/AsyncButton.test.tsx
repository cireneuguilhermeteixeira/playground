import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AsyncButton } from '../components/AsyncButton';
import * as greetingApi from '../api/greetingApi';

jest.mock('../../api/greetingApi');

describe('<AsyncButton />', () => {
  it('uses findByText to wait for the greeting text after the promise resolves', async () => {
    const fetchGreetingMock = greetingApi.fetchGreeting as jest.Mock;
    fetchGreetingMock.mockResolvedValue('Hello, Cireneu!');

    render(<AsyncButton name="Cireneu" />);

    fireEvent.click(screen.getByText('Fetch greeting'));

    const greetingNode = await screen.findByText('Hello, Cireneu!');
    expect(greetingNode).toBeInTheDocument();
  });

  it('uses waitFor to wait until loading disappears', async () => {
    const fetchGreetingMock = greetingApi.fetchGreeting as jest.Mock;
    fetchGreetingMock.mockResolvedValue('Hello, Dev!');

    render(<AsyncButton name="Dev" />);

    fireEvent.click(screen.getByText('Fetch greeting'));

    // Assert that loading is initially shown
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // waitFor keeps re-running the callback until it passes or times out
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('greeting')).toHaveTextContent('Hello, Dev!');
  });
});

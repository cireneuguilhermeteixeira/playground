import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import * as analytics from '../api/analytics';
import { AnalyticsButton } from '../components/AnalyticsButton';

describe('<AnalyticsButton />', () => {
  it('uses jest.spyOn to verify that trackEvent was called with the correct data', () => {
    const spy = jest.spyOn(analytics, 'trackEvent').mockImplementation(() => {
      // We can prevent console.log from running here if we want.
    });

    render(<AnalyticsButton label="Click me" />);

    fireEvent.click(screen.getByText('Click me'));

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('button_click', { label: 'Click me' });

    spy.mockRestore();
  });
});

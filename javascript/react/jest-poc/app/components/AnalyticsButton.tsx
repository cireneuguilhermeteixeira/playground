import React from 'react';
import { trackEvent } from '../api/analytics';

type AnalyticsButtonProps = {
  label: string;
};

export function AnalyticsButton({ label }: AnalyticsButtonProps) {
  function handleClick() {
    trackEvent('button_click', { label });
  }

  return <button onClick={handleClick}>{label}</button>;
}

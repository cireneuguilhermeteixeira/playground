export function trackEvent(name: string, payload?: Record<string, unknown>) {
  // In a real app this could send data to Segment, GA, etc.
  console.log('TRACK', name, payload);
}
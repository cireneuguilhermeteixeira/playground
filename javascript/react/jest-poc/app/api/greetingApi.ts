export async function fetchGreeting(name: string): Promise<string> {
  // In a real app this could be a fetch call.
  return `Hello, ${name}!`;
}
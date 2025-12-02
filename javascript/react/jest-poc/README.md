# React Testing Guide (Jest + Testing Library)

This document explains **when and how to use** the main testing helpers
commonly used in React tests:

- `getBy*`, `queryBy*`, `findBy*`
- `fireEvent`
- `waitFor`
- `act`
- `jest.fn`, `jest.mock`
- `jest.spyOn`

This guide assumes:

- Jest as the test runner
- @testing-library/react
- React 18+ / 19

------------------------------------------------------------------------

## 1. Query Methods

### getBy\*

- Synchronous
- Throws an error immediately if the element is not found

**Use when:** - The element should already exist right after rendering

**Do NOT use when:** - The element appears after asynchronous logic

------------------------------------------------------------------------

### queryBy\*

- Synchronous
- Returns `null` instead of throwing

**Use when:** - Verifying that an element should NOT exist

------------------------------------------------------------------------

### findBy\*

- Asynchronous
- Returns a Promise
- Waits until the element appears

**Use when:** - Elements appear after API calls, timers, or async
effects

------------------------------------------------------------------------

## 2. fireEvent

Simulates basic DOM events like clicks and input changes.

**Use when:** - Simulating low-level DOM events

**Avoid when:** - You want realistic user interactions → prefer
`userEvent`

------------------------------------------------------------------------

## 3. waitFor

Waits for a condition to become true within a timeout.

**Use when:** - Waiting for state changes - Waiting for loading
indicators to disappear - Waiting for mocks to be called

------------------------------------------------------------------------

## 4. act

Forces React to flush updates and effects.

**Use when:** - Driving timers manually - Triggering state updates
outside Testing Library helpers

**Not needed when:** - Using `fireEvent`, `userEvent`, or `render`

------------------------------------------------------------------------

## 5. jest.fn

Creates a mock function.

**Use when:** - You need to track how a function is called - You need to
control return values

------------------------------------------------------------------------

## 6. jest.mock

Replaces an entire module with mocks.

**Use when:** - Mocking APIs - Avoiding real network calls - Speeding up
tests

------------------------------------------------------------------------

## 7. jest.spyOn

Creates a spy on an existing function.

**Use when:** - Observing behavior of real functions - Tracking side
effects

------------------------------------------------------------------------

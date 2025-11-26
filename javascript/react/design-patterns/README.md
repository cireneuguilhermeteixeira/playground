# React Patterns Playground

This repository is a **practical playground for studying and comparing well-known React patterns**, with a strong focus on:

* Component-level design patterns
* Architectural structuring patterns
* Real-world usage with TypeScript

The goal of this project is **learning by implementation**, not just theory.

---

## Implemented Patterns

The following patterns were **fully implemented with real code examples**:

---

## 1. Composition Pattern

### What it is

The **Composition Pattern** is based on assembling components using `children` instead of using many boolean or configuration props.

Instead of:

```tsx
<Component hasHeader hasFooter hasIcon />
```

We build layouts like:

```tsx
<Component>
  <Component.Header />
  <Component.Body />
  <Component.Footer />
</Component>
```

### Pros

* Avoids large prop APIs
* Encourages flexible layout composition
* Makes components more reusable
* Reduces tight coupling

## 2. Compound Component Pattern

### What it is

The **Compound Component Pattern** is a specialization of Composition where:

* A `Root` component controls shared state
* Subcomponents consume that state implicitly using Context
* Children only work correctly when used inside the Root

Example of the public API:

```tsx
<Tabs.Root defaultValue="general">
  <Tabs.List>
    <Tabs.Trigger value="general" />
    <Tabs.Trigger value="settings" />
  </Tabs.List>

  <Tabs.Content value="general" />
  <Tabs.Content value="settings" />
</Tabs.Root>
```

### Pros

* Eliminates prop drilling
* Creates a very expressive API
* Enforces valid component usage
* Centralizes state logic

## 3. HOC (Higher-Order Component) Pattern

### What it is

A **Higher-Order Component (HOC)** is a function that:

* Receives a component
* Returns a new component
* Adds extra behavior to the original one

Example:

```ts
const ProtectedDashboard = withAuth(Dashboard);
```

### Pros

* To demonstrate behavior injection
* To protect routes/components
* To show how cross-cutting concerns can be abstracted

## 4. Presentational Pattern (Container / View Separation)

### What it is

This pattern splits components into:

* **Container** → business logic
* **View** → pure UI rendering

Example:

```tsx
<UserContainer />  // logic only
<UserView />       // UI only
```

### Pros

* Makes UI components fully reusable
* Improves testability
* Keeps business logic isolated
* Avoids mixing API logic with JSX

# Patterns Not Implemented (But Already Used in Other Projects)

These patterns were not reimplemented here because they were already heavily used in other real-world projects:

---

## Custom Hook Pattern

Used to:

* Extract reusable logic
* Share behavior between components

Example:

```ts
function useCounter() {}
```

---

## Provider Pattern (Context API)

Used for:

* Authentication
* Themes
* Global application state

Example:

```tsx
<AuthProvider>
  <App />
</AuthProvider>
```

---

## State Reducer Pattern

Used for:

* Highly customizable components
* Finite state control
* Advanced form libraries

Common usage via:

```ts
useReducer()
```

---

# Architectural Structure Patterns (Examples)

In addition to component patterns, this project also explores **how to structure React applications at a macro level**.

---

## 1. MVC (Model–View–Controller) for Frontend

Adapted structure:

* **Model** → API, data contracts, business helpers
* **Controller** → hooks handling user actions
* **View** → React components

Example:

```txt
products/
  model/
  controller/
  view/
```

---

## 2. MVVM (Model–View–ViewModel)

Very natural fit for React with Hooks.

* **Model** → raw data & API
* **ViewModel** → hooks controlling screen state
* **View** → JSX components

Example:

```txt
orders/
  model/
  view-model/
  view/
```

---

## 3. DDD (Domain-Driven Design) on the Frontend

Used for large-scale enterprise systems.

Layers:

* `domain` → entities, rules
* `application` → use-cases
* `infra` → HTTP, cache
* `ui` → React components

Example:

```txt
modules/
  orders/
    domain/
    application/
    infra/
    ui/
```

---

## 4. Feature-Sliced Architecture (Pragmatic Default)

A practical hybrid of:

* MVVM
* DDD-lite
* Component isolation

Example:

```txt
features/
  auth/
    api/
    model/
    ui/
  products/
    api/
    model/
    ui/
```

---

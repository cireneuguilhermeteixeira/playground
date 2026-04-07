# Java Reflection API POC

This proof of concept shows, in a simple way, what the Java Reflection API is and how it works in practice.

## What is the Reflection API?

Reflection is a Java feature that allows you to inspect and manipulate classes at runtime. With it, you can discover:

- class names
- fields
- methods
- constructors
- annotations
- access modifiers

It also allows you to execute methods dynamically and change field values, including private ones, when the code uses `setAccessible(true)`.

## Where is it used in Java?

Reflection is widely used in libraries and frameworks, for example:

- `Spring`: dependency injection and component discovery
- `Hibernate`: mapping between Java objects and database tables
- `Jackson`: object serialization and deserialization
- testing frameworks: automatic discovery of classes and methods
- plugin and proxy systems: dynamic behavior loading

## Main concepts

### 1. Inspection

You can obtain class information using `Class`, `Field`, `Method`, and `Constructor`.

### 2. Invoke

`Method.invoke(...)` allows you to call a method dynamically.

Examples in this project:

- calling a public method: `introduce()`
- calling a private method: `privateMessage(String)`

### 3. Modify

To change fields dynamically, use `Field`.

Examples in this project:

- `field.set(...)`
- `field.setInt(...)`

This changes the object's state even without direct field access in regular code.

## Best practices

- Prefer normal Java calls over reflection when compile-time access is available.
- Use reflection mainly in infrastructure code, frameworks, libraries, or generic utilities.
- Limit `setAccessible(true)` usage because it breaks encapsulation.
- Cache reflective lookups if they happen frequently, since repeated lookup can be costly.
- Keep reflective code small, well documented, and isolated behind clear abstractions.
- Handle exceptions carefully, especially `NoSuchMethodException`, `NoSuchFieldException`, `IllegalAccessException`, and `InvocationTargetException`.
- Be aware that reflection may be restricted in some modularized or secured runtime environments.

## Project structure

- `src/main/java/com/example/reflection/Person.java`
- `src/main/java/com/example/reflection/ReflectionDemo.java`

## How to run

If Maven is installed:

```bash
mvn compile exec:java
```

## What the demo does

1. Explains the reflection concept
2. Lists fields and methods from the `Person` class
3. Creates an object dynamically through a constructor
4. Executes methods with `invoke`
5. Modifies private fields with `Field.set`

## Important note

Reflection is powerful, but it should be used carefully:

- it weakens encapsulation
- it can have a performance cost
- it can make code harder to understand and maintain

In general, direct reflection in regular business logic should be avoided. It is more appropriate in frameworks, infrastructure, and libraries.

# Java Reflection API POC

This proof of concept shows, in a practical way, what the Java Reflection API is, where it is used, and how its main features work.

## What is the Reflection API?

Reflection is a Java feature that allows you to inspect and manipulate classes at runtime. With it, you can discover:

- class names
- packages
- fields
- methods
- constructors
- annotations
- access modifiers
- superclasses and interfaces
- parameter and return types

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

You can obtain class information using `Class`, `Field`, `Method`, `Constructor`, and `Annotation`.

Examples in this project:

- `getName()`
- `getSimpleName()`
- `getPackageName()`
- `getDeclaredFields()`
- `getDeclaredMethods()`
- `Modifier.toString(...)`

### 2. Invoke

`Method.invoke(...)` allows you to call a method dynamically.

Examples in this project:

- calling a public method: `introduce()`
- calling a method with arguments: `describe(String, boolean)`
- calling a private method: `privateMessage(String)`

### 3. Modify

To change fields dynamically, use `Field`.

Examples in this project:

- `field.set(...)`
- `field.setInt(...)`

This changes the object's state even without direct field access in regular code.

### 4. Annotations

Reflection can inspect annotations at runtime when they use runtime retention.

Examples in this project:

- reading a class annotation
- reading a field annotation
- reading a method annotation

### 5. Constructors

Reflection can list constructors and instantiate objects dynamically with `Constructor.newInstance(...)`.

Examples in this project:

- listing public constructors with `getConstructors()`
- listing all constructors with `getDeclaredConstructors()`
- creating objects with the default constructor
- creating objects with a parameterized constructor

### 6. Inheritance and interfaces

Reflection can inspect class relationships and contracts.

Examples in this project:

- `getSuperclass()`
- `getInterfaces()`

### 7. Method signatures

Reflection can inspect how a method is defined.

Examples in this project:

- `getReturnType()`
- `getParameterTypes()`
- `getParameters()`
- `getModifiers()`

## Best practices

- Prefer normal Java calls over reflection when compile-time access is available.
- Use reflection mainly in infrastructure code, frameworks, libraries, or generic utilities.
- Limit `setAccessible(true)` usage because it breaks encapsulation.
- Cache reflective lookups if they happen frequently, since repeated lookup can be costly.
- Keep reflective code small, well documented, and isolated behind clear abstractions.
- Handle exceptions carefully, especially `NoSuchMethodException`, `NoSuchFieldException`, `IllegalAccessException`, and `InvocationTargetException`.
- Be aware that reflection may be restricted in some modularized or secured runtime environments.
- Prefer `getMethod(...)` for public methods exposed through the type hierarchy and `getDeclaredMethod(...)` when you need members declared directly in the class, including private ones.
- Do not spread reflective access throughout the codebase; keep it in one well-defined layer.
- If you need performance-sensitive dynamic invocation, evaluate `MethodHandle` as a more advanced alternative.

## Project structure

- `src/main/java/com/example/reflection/DemoInfo.java`
- `src/main/java/com/example/reflection/BaseEntity.java`
- `src/main/java/com/example/reflection/Identifiable.java`
- `src/main/java/com/example/reflection/Person.java`
- `src/main/java/com/example/reflection/ReflectionDemo.java`

## How to run

If Maven is installed:

```bash
mvn compile exec:java
```

## What the demo does

1. Explains the reflection concept
2. Lists class metadata, fields, methods, package, and modifiers
3. Inspects superclass and implemented interfaces
4. Reads annotations from class, field, and method
5. Lists constructors and creates objects dynamically
6. Inspects method signatures and parameter types
7. Executes methods with `invoke`
8. Modifies private fields with `Field.set`

## Covered Reflection API features

- `Class`
- `Field`
- `Method`
- `Constructor`
- `Annotation`
- `Modifier`
- `getMethod(...)`
- `getDeclaredMethod(...)`
- `getDeclaredField(...)`
- `getConstructors()`
- `getDeclaredConstructors()`
- `getAnnotations()`
- `getSuperclass()`
- `getInterfaces()`
- `getReturnType()`
- `getParameterTypes()`
- `getParameters()`
- `invoke(...)`
- `set(...)`
- `setInt(...)`
- `newInstance(...)`

## Important note

Reflection is powerful, but it should be used carefully:

- it weakens encapsulation
- it can have a performance cost
- it can make code harder to understand and maintain

In general, direct reflection in regular business logic should be avoided. It is more appropriate in frameworks, infrastructure, and libraries.

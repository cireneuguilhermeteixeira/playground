# Functional Interfaces POC

Minimal Java 25 POC showing:

- `Concept`: what a functional interface is
- `Predicate`: boolean condition with `test`
- `Function`: transform input into output with `apply`
- `Consumer`: receive a value and perform a side effect with `accept`
- `Supplier`: provide a value with `get`
- `BiFunction`: combine two inputs into one result
- `Method Reference`: reuse an existing method as a functional implementation
- `Custom Interface`: create and use a custom `@FunctionalInterface`
- `Composition`: chain multiple functions with `andThen`
- `Stream Pipeline`: combine `filter`, `map`, grouping, and `forEach`
- `Validation Rules`: represent reusable business validations with predicates
- `Strategy Pattern`: switch pricing logic by passing behavior

## What was implemented

This project contains a single class, `FunctionalInterfacesDemo`, with simple examples of the most common functional interfaces from `java.util.function`.

The demo prints small examples for:

- checking a condition with `Predicate`
- transforming text with `Function`
- consuming values with `Consumer`
- generating values with `Supplier`
- combining two numbers with `BiFunction`
- using `String::toUpperCase` as a method reference
- creating a custom functional interface named `TextFormatter`
- composing text transformations to build a slug
- grouping active orders by category with the Stream API
- validating a user registration with a list of rules
- applying different pricing strategies to the same order

## More realistic scenarios covered

Besides the basic examples, the POC now includes slightly more practical cases:

- `Function composition`: useful when data needs to pass through multiple transformations
- `Stream processing`: common in collections, reports, and API response preparation
- `Validation pipelines`: useful in form validation, DTO checks, and business rules
- `Behavior switching`: useful when the same workflow needs different strategies depending on context

## Run

Compile:

```bash
mvn compile
```

Run:

```bash
mvn exec:java
```

The program prints each example to the console so you can see how lambdas and functional interfaces work in practice.

## Notes

- The project is configured for Java 25 through `maven.compiler.release`.
- Maven uses a project-local repository through `.mvn/maven.config`, so dependencies and plugins are stored inside the workspace instead of `~/.m2`.

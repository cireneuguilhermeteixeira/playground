# Streams 1 POC

Minimal Java 25 POC showing:

- `List`: adding, removing, consulting, and iterating values
- `Arrays`: consulting values and simulating add/remove operations
- `map`: transforming each element in a stream
- `filter`: keeping only elements that match a condition
- `Predicate`: reusing a boolean rule inside `filter`

## What was implemented

This project contains a single class, `StreamsOneDemo`, with small examples that introduce common Java Stream concepts.

The demo prints simple examples for:

- adding, consulting, and removing values from a `List`
- consulting values in an array and creating new arrays to simulate add/remove
- converting names to uppercase with `map`
- filtering numbers with `filter`
- creating a reusable `Predicate<String>` and applying it in a stream

## Important note

Some of these terms are related, but they are not the same thing:

- `List` is a collection type
- `Arrays` is a utility class
- `map` and `filter` are stream operations
- `Predicate` is a functional interface

This POC shows how they work together in a basic stream pipeline.

## Run

Compile:

```bash
mvn compile
```

Run:

```bash
mvn exec:java
```

The program prints each example to the console so you can see how these concepts connect in practice.

## Notes

- The project is configured for Java 25 through `maven.compiler.release`.
- Maven uses a project-local repository through `.mvn/maven.config`, so dependencies and plugins are stored inside the workspace instead of `~/.m2`.

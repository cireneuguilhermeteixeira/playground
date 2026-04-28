# Streams 2 POC

Minimal Java 25 POC showing:

- `Supplier`: provide values on demand
- `Consumer`: receive a value and perform a side effect
- `UnaryOperator`: transform a value into another value of the same type
- `BinaryOperator`: combine two values of the same type into one result

## What was implemented

This project contains a single class, `StreamsTwoDemo`, with small examples for four common functional interfaces often used together with streams and general Java APIs.

The demo prints simple examples for:

- generating default tags with `Supplier`
- writing an audit message with `Consumer`
- normalizing text with `UnaryOperator`
- selecting the higher score with `BinaryOperator`
- combining all four interfaces in a small stream pipeline

## Common scenarios

- `Supplier<T>`: lazy values, default configuration, timestamps, IDs, and fallback objects
- `Consumer<T>`: logging, event publishing, notifications, persistence, and printing
- `UnaryOperator<T>`: normalization, formatting, trimming, encryption, or value enrichment
- `BinaryOperator<T>`: reductions, comparisons, merges, totals, and choosing max/min values

## Run

Compile:

```bash
mvn compile
```

Run:

```bash
mvn exec:java
```

The program prints each example to the console so you can see how these interfaces behave in practice.

## Notes

- The project is configured for Java 25 through `maven.compiler.release`.
- Maven uses a project-local repository through `.mvn/maven.config`, so dependencies and plugins are stored inside the workspace instead of `~/.m2`.

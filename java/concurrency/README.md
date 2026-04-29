# Concurrency POC

Minimal Java 25 POC showing:

- `ExecutorService`: execute tasks asynchronously using a thread pool
- `Runnable`: submit tasks that do work without returning a value
- `Callable`: submit tasks that return a result
- `Future`: retrieve results from asynchronous work
- `invokeAll`: execute multiple callables and wait for all results
- `shutdown`: stop accepting new tasks and finish the current ones

## What was implemented

This project contains a single class, `ExecutorServiceDemo`, introducing the basic idea of Java concurrency through `ExecutorService`.

The demo prints simple examples for:

- creating a fixed thread pool with `Executors.newFixedThreadPool(...)`
- submitting `Runnable` tasks
- submitting `Callable` tasks and reading the result with `Future.get()`
- executing a batch of tasks with `invokeAll(...)`
- shutting down the executor with `shutdown()` and `awaitTermination(...)`

## What is `ExecutorService`?

`ExecutorService` is a higher-level concurrency API that manages worker threads for you. Instead of creating and controlling threads manually, you submit tasks and let the executor decide when and where they run.

It is commonly used for:

- background jobs
- report generation
- file processing
- parallel API calls
- email sending
- async service orchestration

## Run

Compile:

```bash
mvn compile
```

Run:

```bash
mvn exec:java
```

The program prints task execution and collected results so you can see how asynchronous execution works in practice.

## Notes

- The project is configured for Java 25 through `maven.compiler.release`.
- Maven uses a project-local repository through `.mvn/maven.config`, so dependencies and plugins are stored inside the workspace instead of `~/.m2`.

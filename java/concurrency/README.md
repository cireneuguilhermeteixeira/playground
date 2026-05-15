# Concurrency POC

Minimal Java 25 POC showing:

- `ExecutorService`: execute tasks asynchronously using a thread pool
- `Runnable`: submit tasks that do work without returning a value
- `Callable`: submit tasks that return a result
- `Future`: retrieve results from asynchronous work
- `invokeAll`: execute multiple callables and wait for all results
- `ReentrantLock`: protect critical sections when multiple threads update shared state
- `AtomicInteger` and `AtomicReference`: update simple shared values without explicit locks
- `shutdown`: stop accepting new tasks and finish the current ones

## What was implemented

This project contains a single class, `ExecutorServiceDemo`, introducing the basic idea of Java concurrency through `ExecutorService`, `Lock`, and atomic variables.

The demo prints simple examples for:

- creating a fixed thread pool with `Executors.newFixedThreadPool(...)`
- submitting `Runnable` tasks
- submitting `Callable` tasks and reading the result with `Future.get()`
- executing a batch of tasks with `invokeAll(...)`
- protecting shared inventory updates with `ReentrantLock`
- incrementing counters and updating the latest processed value with atomic variables
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

## What is `ReentrantLock`?

`ReentrantLock` is an explicit lock implementation from `java.util.concurrent.locks`. It lets you define a critical section so only one thread can enter that block at a time.

In this POC, the lock protects an inventory counter while multiple tasks reserve and replenish items.

It is commonly used for:

- inventory or balance updates
- protecting mutable shared state
- critical sections with more control than `synchronized`
- cases where you may later need features such as `tryLock()` or timed locking

## What are Atomic Variables?

Atomic variables are classes such as `AtomicInteger` and `AtomicReference` that perform thread-safe updates without writing manual lock code for simple operations.

In this POC:

- `AtomicInteger` counts how many events were processed
- `AtomicReference` stores the most recent processed topic

They are commonly used for:

- counters and metrics
- sequence numbers
- flags and state references
- lightweight shared values updated by many threads

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

You will now also see:

- lock-protected stock reservation and replenishment
- atomic counters being incremented safely by concurrent tasks

## Notes

- The project is configured for Java 25 through `maven.compiler.release`.
- Maven uses a project-local repository through `.mvn/maven.config`, so dependencies and plugins are stored inside the workspace instead of `~/.m2`.

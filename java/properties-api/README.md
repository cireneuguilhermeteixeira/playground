# Properties API POC

Minimal Java 25 POC showing:

- `Create`: create a `Properties` object
- `Read`: read properties from a file
- `Store`: save properties to a file
- `System`: read JVM/system properties

## Run

Compile:

```bash
mvn compile
```

Run:

```bash
mvn exec:java
```

The program generates the `target/demo.properties` file and prints the loaded values.

## Notes

- The project is configured for Java 25 through `maven.compiler.release`.
- Maven uses a project-local repository through `.mvn/maven.config`, so dependencies and plugins are stored inside the workspace instead of `~/.m2`.

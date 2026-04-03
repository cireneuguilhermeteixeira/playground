package dev.cdearaujo;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;

public class PropertiesApiDemo {

    public static void main(String[] args) throws IOException {
        Path outputFile = Path.of("target", "demo.properties");
        Path systemOutputFile = Path.of("target", "system.properties");

        Properties createdProperties = createProperties();
        storeProperties(createdProperties, outputFile);

        Properties loadedProperties = readProperties(outputFile);
        Properties systemProperties = System.getProperties();
        storeProperties(systemProperties, systemOutputFile, "JVM system properties");
        printSystemProperties(systemProperties, systemOutputFile);

        System.out.println();
        System.out.println("Read from file:");
        System.out.println("app.name = " + loadedProperties.getProperty("app.name"));
        System.out.println("app.version = " + loadedProperties.getProperty("app.version"));
        System.out.println("app.env = " + loadedProperties.getProperty("app.env"));
        System.out.println("Stored file = " + outputFile.toAbsolutePath());
    }

    private static Properties createProperties() {
        Properties properties = new Properties();
        properties.setProperty("app.name", "properties-api-poc");
        properties.setProperty("app.version", "1.0.0");
        properties.setProperty("app.env", "dev");

        System.out.println("Create:");
        System.out.println("Properties object created in memory.");

        return properties;
    }

    private static void storeProperties(Properties properties, Path outputFile) throws IOException {
        storeProperties(properties, outputFile, "Simple Properties API demo");
    }

    private static void storeProperties(Properties properties, Path outputFile, String comment) throws IOException {
        Files.createDirectories(outputFile.getParent());

        try (OutputStream outputStream = Files.newOutputStream(outputFile)) {
            properties.store(outputStream, comment);
        }

        System.out.println();
        System.out.println("Store:");
        System.out.println("Properties saved to file.");
    }

    private static Properties readProperties(Path inputFile) throws IOException {
        Properties loadedProperties = new Properties();

        try (InputStream inputStream = Files.newInputStream(inputFile)) {
            loadedProperties.load(inputStream);
        }

        System.out.println();
        System.out.println("Read:");
        System.out.println("Properties loaded from file.");

        return loadedProperties;
    }

    private static void printSystemProperties(Properties systemProperties, Path systemOutputFile) {
        System.out.println();
        System.out.println("System:");
        System.out.println("java.version = " + systemProperties.getProperty("java.version"));
        System.out.println("java.vendor = " + systemProperties.getProperty("java.vendor"));
        System.out.println("user.name = " + systemProperties.getProperty("user.name"));
        System.out.println("os.name = " + systemProperties.getProperty("os.name"));
        System.out.println("System properties file = " + systemOutputFile.toAbsolutePath());
    }
}

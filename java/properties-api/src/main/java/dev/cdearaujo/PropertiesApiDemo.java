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

        Properties createdProperties = createProperties();
        storeProperties(createdProperties, outputFile);

        Properties loadedProperties = readProperties(outputFile);
        printSystemProperties();

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
        Files.createDirectories(outputFile.getParent());

        try (OutputStream outputStream = Files.newOutputStream(outputFile)) {
            properties.store(outputStream, "Simple Properties API demo");
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

    private static void printSystemProperties() {
        System.out.println();
        System.out.println("System:");
        System.out.println("java.version = " + System.getProperty("java.version"));
        System.out.println("java.vendor = " + System.getProperty("java.vendor"));
        System.out.println("user.name = " + System.getProperty("user.name"));
        System.out.println("os.name = " + System.getProperty("os.name"));
    }
}

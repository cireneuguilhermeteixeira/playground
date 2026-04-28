package dev.cdearaujo;

import java.util.List;
import java.util.function.BinaryOperator;
import java.util.function.Consumer;
import java.util.function.Supplier;
import java.util.function.UnaryOperator;

public class StreamsTwoDemo {

    public static void main(String[] args) {
        System.out.println("POC - Java Streams 2");
        System.out.println("====================");

        showSupplierExample();
        showConsumerExample();
        showUnaryOperatorExample();
        showBinaryOperatorExample();
        showCombinedPipelineExample();
    }

    private static void showSupplierExample() {
        Supplier<List<String>> defaultTagsSupplier = () -> List.of("java", "streams", "poc");

        System.out.println();
        System.out.println("Supplier:");
        System.out.println("Common scenario: generate default values, lazy configuration, or fallback objects.");
        System.out.println("Generated tags: " + defaultTagsSupplier.get());
    }

    private static void showConsumerExample() {
        Consumer<String> auditConsumer = message -> System.out.println("Audit log: " + message);

        System.out.println();
        System.out.println("Consumer:");
        System.out.println("Common scenario: logging, notifications, persistence, or any side effect.");
        auditConsumer.accept("order created");
    }

    private static void showUnaryOperatorExample() {
        UnaryOperator<String> normalizeName = text -> text.trim().toUpperCase();

        System.out.println();
        System.out.println("UnaryOperator:");
        System.out.println("Common scenario: transform a value into another value of the same type.");
        System.out.println("Normalized name: " + normalizeName.apply("  alice  "));
    }

    private static void showBinaryOperatorExample() {
        BinaryOperator<Integer> maxScore = Integer::max;

        System.out.println();
        System.out.println("BinaryOperator:");
        System.out.println("Common scenario: merge or compare two values of the same type.");
        System.out.println("Higher score between 72 and 91: " + maxScore.apply(72, 91));
    }

    private static void showCombinedPipelineExample() {
        Supplier<List<String>> namesSupplier = () -> List.of("  ana  ", "bruno", "  carla");
        UnaryOperator<String> normalize = name -> name.trim().toUpperCase();
        Consumer<String> printer = name -> System.out.println("Processed name: " + name);
        BinaryOperator<String> chooseLonger = (left, right) -> left.length() >= right.length() ? left : right;

        System.out.println();
        System.out.println("Combined pipeline:");
        System.out.println("A small flow using all four interfaces together.");

        List<String> names = namesSupplier.get();
        List<String> normalizedNames = names.stream()
                .map(normalize)
                .toList();

        normalizedNames.forEach(printer);

        String longestName = normalizedNames.stream()
                .reduce(chooseLonger)
                .orElse("N/A");

        System.out.println("Longest normalized name: " + longestName);
    }
}

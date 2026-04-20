package dev.cdearaujo;

import java.util.List;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;

public class FunctionalInterfacesDemo {

    public static void main(String[] args) {
        System.out.println("POC - Java Functional Interfaces");
        System.out.println("================================");

        explainConcept();
        runPredicateExample();
        runFunctionExample();
        runConsumerExample();
        runSupplierExample();
        runBiFunctionExample();
        runMethodReferenceExample();
        runCustomFunctionalInterfaceExample();
    }

    private static void explainConcept() {
        System.out.println();
        System.out.println("What is a functional interface?");
        System.out.println("A functional interface is an interface with exactly one abstract method.");
        System.out.println("It is the base for lambdas and method references in Java.");
    }

    private static void runPredicateExample() {
        Predicate<Integer> isAdult = age -> age >= 18;

        System.out.println();
        System.out.println("Predicate:");
        System.out.println("16 is adult? " + isAdult.test(16));
        System.out.println("21 is adult? " + isAdult.test(21));
    }

    private static void runFunctionExample() {
        Function<String, String> toUpperCase = text -> text.toUpperCase();

        System.out.println();
        System.out.println("Function:");
        System.out.println("java -> " + toUpperCase.apply("java"));
    }

    private static void runConsumerExample() {
        Consumer<String> printMessage = message -> System.out.println("Consumed value: " + message);

        System.out.println();
        System.out.println("Consumer:");
        printMessage.accept("Functional interfaces are practical.");
    }

    private static void runSupplierExample() {
        Supplier<String> defaultEnvironment = () -> "dev";

        System.out.println();
        System.out.println("Supplier:");
        System.out.println("Generated value: " + defaultEnvironment.get());
    }

    private static void runBiFunctionExample() {
        BiFunction<Integer, Integer, Integer> sum = Integer::sum;

        System.out.println();
        System.out.println("BiFunction:");
        System.out.println("10 + 15 = " + sum.apply(10, 15));
    }

    private static void runMethodReferenceExample() {
        List<String> names = List.of("ana", "bruno", "carla");
        Function<String, String> normalizeName = String::toUpperCase;

        System.out.println();
        System.out.println("Method reference:");
        names.stream()
                .map(normalizeName)
                .forEach(name -> System.out.println("Normalized name: " + name));
    }

    private static void runCustomFunctionalInterfaceExample() {
        TextFormatter excitedFormatter = text -> text + "!";

        System.out.println();
        System.out.println("Custom functional interface:");
        System.out.println(excitedFormatter.format("Simple custom formatter"));
    }

    @FunctionalInterface
    interface TextFormatter {
        String format(String text);
    }
}

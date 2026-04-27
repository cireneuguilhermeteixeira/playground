package dev.cdearaujo;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;

public class FunctionalInterfacesDemo {

    public static void main(String[] args) {
        System.out.println("POC - Java Functional Interfaces");
        System.out.println("================================");

        runPredicateExample();
        runFunctionExample();
        runConsumerExample();
        runSupplierExample();
        runBiFunctionExample();
        runMethodReferenceExample();
        runCustomFunctionalInterfaceExample();
        runComposedFunctionExample();
        runStreamPipelineExample();
        runValidationExample();
        runPricingStrategyExample();
    }


    private static void runPredicateExample() {
        Predicate<Integer> isAdult = age -> age >= 18;

        System.out.println();
        System.out.println("Predicate:");
        System.out.println("Common scenario: validations and filters such as checking age, status, or permissions.");
        System.out.println("16 is adult? " + isAdult.test(16));
        System.out.println("21 is adult? " + isAdult.test(21));
    }

    private static void runFunctionExample() {
        Function<String, String> toUpperCase = text -> text.toUpperCase();

        System.out.println();
        System.out.println("Function:");
        System.out.println("Common scenario: data transformation such as formatting text, mapping DTOs, or normalizing values.");
        System.out.println("java -> " + toUpperCase.apply("java"));
    }

    private static void runConsumerExample() {
        Consumer<String> printMessage = message -> System.out.println("Consumed value: " + message);

        System.out.println();
        System.out.println("Consumer:");
        System.out.println("Common scenario: side effects such as logging, printing, saving, or sending notifications.");
        printMessage.accept("Functional interfaces are practical.");
    }

    private static void runSupplierExample() {
        Supplier<String> defaultEnvironment = () -> "dev";

        System.out.println();
        System.out.println("Supplier:");
        System.out.println("Common scenario: lazy value creation such as default config, tokens, timestamps, or fallback objects.");
        System.out.println("Generated value: " + defaultEnvironment.get());
    }

    private static void runBiFunctionExample() {
        BiFunction<Integer, Integer, Integer> sum = Integer::sum;

        System.out.println();
        System.out.println("BiFunction:");
        System.out.println("Common scenario: combining two inputs such as price + discount, first name + last name, or key + value.");
        System.out.println("10 + 15 = " + sum.apply(10, 15));
    }

    private static void runMethodReferenceExample() {
        List<String> names = List.of("ana", "bruno", "carla");
        Function<String, String> normalizeName = String::toUpperCase;

        System.out.println();
        System.out.println("Method reference:");
        System.out.println("Common scenario: reusing existing methods in streams and callbacks without writing a full lambda.");
        names.stream()
                .map(normalizeName)
                .forEach(name -> System.out.println("Normalized name: " + name));
    }

    private static void runCustomFunctionalInterfaceExample() {
        TextFormatter excitedFormatter = text -> text + "!";

        System.out.println();
        System.out.println("Custom functional interface:");
        System.out.println("Common scenario: domain-specific behavior such as pricing, formatting, scoring, or approval rules.");
        System.out.println(excitedFormatter.format("Simple custom formatter"));
    }

    private static void runComposedFunctionExample() {
        Function<String, String> trim = String::trim;
        Function<String, String> normalize = text -> text.toLowerCase(Locale.ROOT);
        Function<String, String> slugify = text -> text.replace(" ", "-");
        Function<String, String> buildSlug = trim.andThen(normalize).andThen(slugify);

        System.out.println();
        System.out.println("Function composition:");
        System.out.println("Input: '  Functional Interfaces in Java  '");
        System.out.println("Slug: " + buildSlug.apply("  Functional Interfaces in Java  "));
    }

    private static void runStreamPipelineExample() {
        List<Order> orders = List.of(
                new Order("Notebook", "electronics", 3500.00, true),
                new Order("Mouse", "electronics", 120.00, true),
                new Order("Desk", "furniture", 900.00, false),
                new Order("Chair", "furniture", 700.00, true)
        );

        Predicate<Order> isActive = Order::active;
        Function<Order, String> category = Order::category;
        Consumer<Map.Entry<String, Long>> printGroup = entry ->
                System.out.println(entry.getKey() + " -> " + entry.getValue() + " active order(s)");

        System.out.println();
        System.out.println("Stream pipeline:");
        orders.stream()
                .filter(isActive)
                .map(category)
                .collect(java.util.stream.Collectors.groupingBy(Function.identity(), java.util.stream.Collectors.counting()))
                .entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(printGroup);
    }

    private static void runValidationExample() {
        UserRegistration validUser = new UserRegistration("Alice", "alice@example.com", 22);
        UserRegistration invalidUser = new UserRegistration("Bo", "invalid-email", 15);

        List<ValidationRule<UserRegistration>> rules = List.of(
                ValidationRule.of(user -> user.name().length() >= 3, "name must have at least 3 characters"),
                ValidationRule.of(user -> user.email().contains("@"), "email must contain @"),
                ValidationRule.of(user -> user.age() >= 18, "user must be an adult")
        );

        System.out.println();
        System.out.println("Validation rules:");
        printValidationResult(validUser, rules);
        printValidationResult(invalidUser, rules);
    }

    private static void runPricingStrategyExample() {
        Order order = new Order("Headphones", "electronics", 800.00, true);

        PricingStrategy regularPricing = total -> total;
        PricingStrategy vipPricing = total -> total * 0.85;
        PricingStrategy campaignPricing = total -> total > 500 ? total - 100 : total;

        System.out.println();
        System.out.println("Pricing strategy:");
        printPrice("Regular", order, regularPricing);
        printPrice("VIP", order, vipPricing);
        printPrice("Campaign", order, campaignPricing);
    }

    private static void printValidationResult(UserRegistration user, List<ValidationRule<UserRegistration>> rules) {
        List<String> errors = rules.stream()
                .filter(rule -> !rule.predicate().test(user))
                .map(ValidationRule::message)
                .toList();

        if (errors.isEmpty()) {
            System.out.println(user.name() + " -> valid registration");
            return;
        }

        System.out.println(user.name() + " -> invalid registration: " + String.join(", ", errors));
    }

    private static void printPrice(String label, Order order, PricingStrategy pricingStrategy) {
        double finalPrice = pricingStrategy.apply(order.price());
        System.out.println(label + " price for " + order.name() + ": " + finalPrice);
    }

    @FunctionalInterface
    interface TextFormatter {
        String format(String text);
    }

    @FunctionalInterface
    interface PricingStrategy {
        double apply(double total);
    }

    record Order(String name, String category, double price, boolean active) {
    }

    record UserRegistration(String name, String email, int age) {
    }

    record ValidationRule<T>(Predicate<T> predicate, String message) {
        static <T> ValidationRule<T> of(Predicate<T> predicate, String message) {
            return new ValidationRule<>(predicate, message);
        }
    }
}

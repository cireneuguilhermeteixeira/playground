package dev.cdearaujo;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;

public class StreamsOneDemo {

    public static void main(String[] args) {
        System.out.println("POC - Java Streams 1");
        System.out.println("====================");

        showListExample();
        showArrayExample();
        showMapExample();
        showFilterExample();
        showPredicateExample();
    }

    private static void showListExample() {
        List<String> languages = List.of("Java", "Python", "Go", "Kotlin");

        System.out.println();
        System.out.println("List:");
        languages.forEach(language -> System.out.println("Language: " + language));
    }

    private static void showArrayExample() {
        String[] cities = {"Recife", "Fortaleza", "Salvador"};

        System.out.println();
        System.out.println("Arrays:");
        Arrays.stream(cities)
                .forEach(city -> System.out.println("City: " + city));
    }

    private static void showMapExample() {
        List<String> names = List.of("ana", "bruno", "carla");

        System.out.println();
        System.out.println("Map:");
        names.stream()
                .map(String::toUpperCase)
                .forEach(name -> System.out.println("Mapped name: " + name));
    }

    private static void showFilterExample() {
        List<Integer> numbers = List.of(3, 8, 12, 17, 20);

        System.out.println();
        System.out.println("Filter:");
        numbers.stream()
                .filter(number -> number >= 10)
                .forEach(number -> System.out.println("Filtered number: " + number));
    }

    private static void showPredicateExample() {
        List<String> usernames = List.of("alice", "bob", "charlie", "dani");
        Predicate<String> hasAtLeastFiveCharacters = username -> username.length() >= 5;

        System.out.println();
        System.out.println("Predicate:");
        usernames.stream()
                .filter(hasAtLeastFiveCharacters)
                .forEach(username -> System.out.println("Accepted username: " + username));
    }
}

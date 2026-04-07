package com.example.reflection;

public class Person {

    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String introduce() {
        return "Hello, my name is " + name + " and I am " + age + " years old.";
    }

    private String privateMessage(String prefix) {
        return prefix + ": private method access via reflection";
    }
}

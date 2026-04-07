package com.example.reflection;

@DemoInfo("Sample domain object used in the reflection demo")
public class Person extends BaseEntity implements Identifiable {

    @DemoInfo("Person full name")
    private String name;
    private int age;

    public Person() {
        super();
        this.name = "Unknown";
        this.age = 0;
    }

    public Person(String name, int age) {
        super(1L);
        this.name = name;
        this.age = age;
    }

    @DemoInfo("Public method invoked dynamically")
    public String introduce() {
        return "Hello, my name is " + name + " and I am " + age + " years old.";
    }

    public String describe(String city, boolean active) {
        return name + " lives in " + city + " and active=" + active;
    }

    @Override
    public String getIdentifier() {
        return "PERSON-" + id;
    }

    private String privateMessage(String prefix) {
        return prefix + ": private method access via reflection";
    }
}

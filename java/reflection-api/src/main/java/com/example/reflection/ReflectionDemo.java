package com.example.reflection;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;

public class ReflectionDemo {

    public static void main(String[] args) throws Exception {
        System.out.println("POC - Java Reflection API");
        System.out.println("=========================");

        Class<Person> personClass = Person.class;

        explainConcept();
        inspectClass(personClass);
        createInstanceDynamically(personClass);
        invokeMethods(personClass);
        modifyPrivateFields(personClass);
    }

    private static void explainConcept() {
        System.out.println("\n1. What is the Reflection API?");
        System.out.println("Reflection is the ability to inspect and manipulate classes, methods, fields, and constructors at runtime.");
        System.out.println("Instead of relying only on statically compiled code, you can discover class details dynamically.");

        System.out.println("\n2. In which Java contexts is it used?");
        System.out.println("- Frameworks such as Spring, Hibernate, and Jackson");
        System.out.println("- Dependency injection");
        System.out.println("- Object-relational mapping");
        System.out.println("- Serialization and deserialization");
        System.out.println("- Testing tools, proxies, and plugin systems");
        System.out.println("Use it carefully: reflection weakens encapsulation, can be slower, and may hurt maintainability when overused.");
    }

    private static void inspectClass(Class<Person> personClass) {
        System.out.println("\n3. Metadata inspection");
        System.out.println("Class name: " + personClass.getName());

        System.out.println("\nDeclared fields:");
        for (Field field : personClass.getDeclaredFields()) {
            System.out.println("- " + field.getName() + " (" + field.getType().getSimpleName() + ")");
        }

        System.out.println("\nDeclared methods:");
        for (Method method : personClass.getDeclaredMethods()) {
            System.out.println("- " + method.getName() + " | modifiers: " + Modifier.toString(method.getModifiers()));
        }
    }

    private static void createInstanceDynamically(Class<Person> personClass) throws Exception {
        System.out.println("\n4. Dynamic creation with Constructor");
        Constructor<Person> constructor = personClass.getConstructor(String.class, int.class);
        Person person = constructor.newInstance("Anna", 28);
        System.out.println("Created instance: " + person.introduce());
    }

    private static void invokeMethods(Class<Person> personClass) throws Exception {
        System.out.println("\n5. Using invoke");
        Person person = new Person("Brian", 32);

        Method publicMethod = personClass.getMethod("introduce");
        String publicReturn = (String) publicMethod.invoke(person);
        System.out.println("invoke on public method: " + publicReturn);

        Method privateMethod = personClass.getDeclaredMethod("privateMessage", String.class);
        privateMethod.setAccessible(true);
        String privateReturn = (String) privateMethod.invoke(person, "DEBUG");
        System.out.println("invoke on private method: " + privateReturn);

        System.out.println("invoke executes a method dynamically at runtime.");
    }

    private static void modifyPrivateFields(Class<Person> personClass) throws Exception {
        System.out.println("\n6. Modify: changing private fields");
        Person person = new Person("Carol", 19);
        System.out.println("Before change: " + person.introduce());

        Field nameField = personClass.getDeclaredField("name");
        nameField.setAccessible(true);
        nameField.set(person, "Carol Updated");

        Field ageField = personClass.getDeclaredField("age");
        ageField.setAccessible(true);
        ageField.setInt(person, 20);

        System.out.println("After change: " + person.introduce());
        System.out.println("Field.set(...) and variants such as setInt(...) allow dynamic field updates.");
    }
}

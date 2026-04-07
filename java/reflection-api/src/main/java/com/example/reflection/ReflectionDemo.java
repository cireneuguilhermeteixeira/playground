package com.example.reflection;

import java.lang.annotation.Annotation;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;

public class ReflectionDemo {

    public static void main(String[] args) throws Exception {
        System.out.println("POC - Java Reflection API");
        System.out.println("=========================");

        Class<Person> personClass = Person.class;

        explainConcept();
        inspectClass(personClass);
        inspectInheritance(personClass);
        inspectAnnotations(personClass);
        inspectConstructors(personClass);
        inspectMethodDetails(personClass);
        createInstanceDynamically(personClass);
        invokeMethods(personClass);
        modifyPrivateFields(personClass);
    }

    private static void explainConcept() {
        System.out.println("\n1. What is the Reflection API?");
        System.out.println("Reflection lets Java inspect and manipulate types, members, and metadata at runtime.");
        System.out.println("It is commonly used by frameworks, serializers, ORMs, DI containers, proxies, and testing tools.");
    }

    private static void inspectClass(Class<Person> personClass) {
        System.out.println("\n2. Metadata inspection");
        System.out.println("Class name: " + personClass.getName());
        System.out.println("Simple name: " + personClass.getSimpleName());
        System.out.println("Package: " + personClass.getPackageName());
        System.out.println("Modifiers: " + Modifier.toString(personClass.getModifiers()));

        System.out.println("\nDeclared fields:");
        for (Field field : personClass.getDeclaredFields()) {
            System.out.println("- " + field.getName()
                    + " (" + field.getType().getSimpleName() + ")"
                    + " | modifiers: " + Modifier.toString(field.getModifiers()));
        }

        System.out.println("\nDeclared methods:");
        for (Method method : personClass.getDeclaredMethods()) {
            System.out.println("- " + method.getName() + " | modifiers: " + Modifier.toString(method.getModifiers()));
        }
    }

    private static void inspectInheritance(Class<Person> personClass) {
        System.out.println("\n3. Inheritance and interfaces");
        System.out.println("Superclass: " + personClass.getSuperclass().getSimpleName());

        System.out.println("Interfaces:");
        for (Class<?> contract : personClass.getInterfaces()) {
            System.out.println("- " + contract.getSimpleName());
        }
    }

    private static void inspectAnnotations(Class<Person> personClass) throws Exception {
        System.out.println("\n4. Annotations");

        System.out.println("Class annotations:");
        for (Annotation annotation : personClass.getAnnotations()) {
            System.out.println("- " + annotation.annotationType().getSimpleName() + ": " + annotation);
        }

        Field nameField = personClass.getDeclaredField("name");
        DemoInfo fieldAnnotation = nameField.getAnnotation(DemoInfo.class);
        System.out.println("Field 'name' annotation: " + fieldAnnotation.value());

        Method introduceMethod = personClass.getDeclaredMethod("introduce");
        DemoInfo methodAnnotation = introduceMethod.getAnnotation(DemoInfo.class);
        System.out.println("Method 'introduce' annotation: " + methodAnnotation.value());
    }

    private static void inspectConstructors(Class<Person> personClass) {
        System.out.println("\n5. Constructors");

        System.out.println("Public constructors:");
        for (Constructor<?> constructor : personClass.getConstructors()) {
            System.out.println("- " + constructor.getName() + " | parameter count: " + constructor.getParameterCount());
        }

        System.out.println("Declared constructors:");
        for (Constructor<?> constructor : personClass.getDeclaredConstructors()) {
            System.out.println("- " + constructor.getName() + " | modifiers: " + Modifier.toString(constructor.getModifiers()));
        }
    }

    private static void inspectMethodDetails(Class<Person> personClass) throws Exception {
        System.out.println("\n6. Method signatures");
        Method describeMethod = personClass.getDeclaredMethod("describe", String.class, boolean.class);

        System.out.println("Method name: " + describeMethod.getName());
        System.out.println("Return type: " + describeMethod.getReturnType().getSimpleName());

        System.out.println("Parameter types:");
        for (Class<?> parameterType : describeMethod.getParameterTypes()) {
            System.out.println("- " + parameterType.getSimpleName());
        }

        System.out.println("Parameters:");
        for (Parameter parameter : describeMethod.getParameters()) {
            System.out.println("- " + parameter.getName() + " : " + parameter.getType().getSimpleName());
        }
    }

    private static void createInstanceDynamically(Class<Person> personClass) throws Exception {
        System.out.println("\n7. Dynamic creation with Constructor");
        Constructor<Person> defaultConstructor = personClass.getConstructor();
        Person defaultPerson = defaultConstructor.newInstance();
        System.out.println("Created with default constructor: " + defaultPerson.introduce());

        Constructor<Person> constructor = personClass.getConstructor(String.class, int.class);
        Person person = constructor.newInstance("Test", 28);
        System.out.println("Created instance: " + person.introduce());
    }

    private static void invokeMethods(Class<Person> personClass) throws Exception {
        System.out.println("\n8. Using invoke");
        Person person = new Person("Cireneu", 31);

        Method publicMethod = personClass.getMethod("introduce");
        String publicReturn = (String) publicMethod.invoke(person);
        System.out.println("invoke on public method: " + publicReturn);

        Method methodWithArguments = personClass.getDeclaredMethod("describe", String.class, boolean.class);
        String described = (String) methodWithArguments.invoke(person, "Recife", true);
        System.out.println("invoke with arguments: " + described);

        Method privateMethod = personClass.getDeclaredMethod("privateMessage", String.class);
        privateMethod.setAccessible(true);
        String privateReturn = (String) privateMethod.invoke(person, "DEBUG");
        System.out.println("invoke on private method: " + privateReturn);

        System.out.println("invoke executes a method dynamically at runtime.");
    }

    private static void modifyPrivateFields(Class<Person> personClass) throws Exception {
        System.out.println("\n9. Modify: changing private fields");
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

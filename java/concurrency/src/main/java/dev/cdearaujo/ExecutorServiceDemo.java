package dev.cdearaujo;

import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

public class ExecutorServiceDemo {

    public static void main(String[] args) throws InterruptedException, ExecutionException {
        System.out.println("POC - Java Concurrency");
        System.out.println("======================");

        runRunnableTasks();
        runCallableTasks();
        runInvokeAllExample();
    }


    private static void runRunnableTasks() throws InterruptedException {
        ExecutorService executorService = Executors.newFixedThreadPool(2);

        System.out.println();
        System.out.println("Runnable tasks:");

        Runnable loadUserTask = () -> printTask("load-user", 300);
        Runnable loadOrdersTask = () -> printTask("load-orders", 200);
        Runnable loadPaymentsTask = () -> printTask("load-payments", 100);

        executorService.submit(loadUserTask);
        executorService.submit(loadOrdersTask);
        executorService.submit(loadPaymentsTask);

        shutdownAndAwait(executorService);
    }

    private static void runCallableTasks() throws InterruptedException, ExecutionException {
        ExecutorService executorService = Executors.newFixedThreadPool(2);

        System.out.println();
        System.out.println("Callable tasks with Future:");

        Callable<String> productTask = () -> fetchValue("product", 250);
        Callable<String> pricingTask = () -> fetchValue("pricing", 150);

        Future<String> productFuture = executorService.submit(productTask);
        Future<String> pricingFuture = executorService.submit(pricingTask);

        System.out.println("Future result 1: " + productFuture.get());
        System.out.println("Future result 2: " + pricingFuture.get());

        shutdownAndAwait(executorService);
    }

    private static void runInvokeAllExample() throws InterruptedException, ExecutionException {
        ExecutorService executorService = Executors.newFixedThreadPool(3);

        System.out.println();
        System.out.println("invokeAll:");

        Callable<String> inventoryTask = () -> fetchValue("inventory", 200);
        Callable<String> shippingTask = () -> fetchValue("shipping", 300);
        Callable<String> customerTask = () -> fetchValue("customer", 100);

        List<Callable<String>> tasks = List.of(
                inventoryTask,
                shippingTask,
                customerTask
        );

        List<Future<String>> futures = executorService.invokeAll(tasks);
        for (Future<String> future : futures) {
            System.out.println("Collected result: " + future.get());
        }

        shutdownAndAwait(executorService);
    }

    private static void printTask(String taskName, long delayInMillis) {
        try {
            TimeUnit.MILLISECONDS.sleep(delayInMillis);
            System.out.println(Thread.currentThread().getName() + " executed task: " + taskName);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            System.out.println("Task interrupted: " + taskName);
        }
    }

    private static String fetchValue(String resourceName, long delayInMillis) throws InterruptedException {
        TimeUnit.MILLISECONDS.sleep(delayInMillis);
        return Thread.currentThread().getName() + " returned " + resourceName;
    }

    private static void shutdownAndAwait(ExecutorService executorService) throws InterruptedException {
        executorService.shutdown();

        boolean finished = executorService.awaitTermination(3, TimeUnit.SECONDS);
        System.out.println("Executor finished? " + finished);
    }
}

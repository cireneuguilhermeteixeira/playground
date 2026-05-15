package dev.cdearaujo;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class ExecutorServiceDemo {

    public static void main(String[] args) throws InterruptedException, ExecutionException {
        System.out.println("POC - Java Concurrency");
        System.out.println("======================");

        runRunnableTasks();
        runCallableTasks();
        runInvokeAllExample();
        runLockExample();
        runAtomicVariablesExample();
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

    private static void runLockExample() throws InterruptedException {
        ExecutorService executorService = Executors.newFixedThreadPool(3);
        Lock lock = new ReentrantLock();
        InventoryCounter inventoryCounter = new InventoryCounter(lock, 10);

        System.out.println();
        System.out.println("Java Locks with ReentrantLock:");

        Runnable reserveOrderA = () -> reserveItems(inventoryCounter, "order-A", 4);
        Runnable reserveOrderB = () -> reserveItems(inventoryCounter, "order-B", 3);
        Runnable replenishInventory = () -> addItems(inventoryCounter, "supplier-restock", 5);

        executorService.submit(reserveOrderA);
        executorService.submit(reserveOrderB);
        executorService.submit(replenishInventory);

        shutdownAndAwait(executorService);
        System.out.println("Final stock after lock-protected operations: " + inventoryCounter.getAvailableItems());
    }

    private static void runAtomicVariablesExample() throws InterruptedException {
        ExecutorService executorService = Executors.newFixedThreadPool(4);
        AtomicInteger processedEvents = new AtomicInteger(0);
        AtomicReference<String> lastProcessedTopic = new AtomicReference<>("none");

        System.out.println();
        System.out.println("Atomic Variables:");

        for (int eventNumber = 1; eventNumber <= 4; eventNumber++) {
            int currentEvent = eventNumber;
            executorService.submit(() -> processEvent(processedEvents, lastProcessedTopic, currentEvent));
        }

        shutdownAndAwait(executorService);
        System.out.println("Total processed events: " + processedEvents.get());
        System.out.println("Last processed topic: " + lastProcessedTopic.get());
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

    private static void reserveItems(InventoryCounter inventoryCounter, String operationName, int quantity) {
        try {
            inventoryCounter.removeItems(quantity);
            System.out.println(Thread.currentThread().getName()
                    + " reserved " + quantity + " items for " + operationName
                    + ". Remaining stock: " + inventoryCounter.getAvailableItems());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            System.out.println("Reservation interrupted for " + operationName);
        }
    }

    private static void addItems(InventoryCounter inventoryCounter, String operationName, int quantity) {
        try {
            inventoryCounter.addItems(quantity);
            System.out.println(Thread.currentThread().getName()
                    + " added " + quantity + " items from " + operationName
                    + ". Current stock: " + inventoryCounter.getAvailableItems());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            System.out.println("Restock interrupted for " + operationName);
        }
    }

    private static void processEvent(
            AtomicInteger processedEvents,
            AtomicReference<String> lastProcessedTopic,
            int eventNumber
    ) {
        try {
            TimeUnit.MILLISECONDS.sleep(100L * eventNumber);
            int currentTotal = processedEvents.incrementAndGet();
            String topicName = "event-" + eventNumber;
            lastProcessedTopic.set(topicName);

            System.out.println(Thread.currentThread().getName()
                    + " processed " + topicName
                    + ". Atomic counter: " + currentTotal);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            System.out.println("Event interrupted: event-" + eventNumber);
        }
    }

    private static void shutdownAndAwait(ExecutorService executorService) throws InterruptedException {
        executorService.shutdown();

        boolean finished = executorService.awaitTermination(3, TimeUnit.SECONDS);
        System.out.println("Executor finished? " + finished);
    }

    private static final class InventoryCounter {
        private final Lock lock;
        private int availableItems;

        private InventoryCounter(Lock lock, int initialItems) {
            this.lock = lock;
            this.availableItems = initialItems;
        }

        private void addItems(int quantity) throws InterruptedException {
            lock.lock();
            try {
                TimeUnit.MILLISECONDS.sleep(120);
                availableItems += quantity;
            } finally {
                lock.unlock();
            }
        }

        private void removeItems(int quantity) throws InterruptedException {
            lock.lock();
            try {
                TimeUnit.MILLISECONDS.sleep(150);
                availableItems -= quantity;
            } finally {
                lock.unlock();
            }
        }

        private int getAvailableItems() {
            lock.lock();
            try {
                return availableItems;
            } finally {
                lock.unlock();
            }
        }
    }
}

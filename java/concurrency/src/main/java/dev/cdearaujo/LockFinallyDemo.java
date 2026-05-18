package dev.cdearaujo;

import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class LockFinallyDemo {

    private final Lock lock = new ReentrantLock();
    private int availableItems = 10;

    public static void main(String[] args) {
        LockFinallyDemo demo = new LockFinallyDemo();
        int items = demo.getAvailableItems();
        System.out.println("Returned value: " + items);
    }

    private int getAvailableItems() {
        lock.lock();
        try {
            System.out.println("Inside try: preparing return with availableItems = " + availableItems);
            return availableItems;
        } finally {
            System.out.println("Inside finally: unlocking before method returns");
            lock.unlock();
        }
    }
}

package dev.cdearaujo;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/*
 * Constraints for the synchronization implementation:
 *
 * 1. Car Capacity:
 *    The car can only depart when it is completely full
 *    (exactly C passengers on board).
 *
 * 2. Departure:
 *    Passengers cannot board while the car is in motion.
 *
 * 3. End of the Ride:
 *    The car cannot end the ride until all C passengers are seated.
 *
 * 4. Disembarkation:
 *    The car can only open its doors and allow a new group to board
 *    when all C passengers from the previous round have disembarked.
 */
public class RollerCoasterSimulation {

    private final RollerCoasterConfig config;
    private final Lock lock = new ReentrantLock();
    private final Condition boardingAllowed = lock.newCondition();
    private final Condition carCanDepart = lock.newCondition();
    private final Condition unboardingAllowed = lock.newCondition();
    private final Condition rideCompleted = lock.newCondition();

    private volatile boolean stopRequested;
    private int currentRound = 1;
    private int unloadingRound;
    private int boardedPassengers;
    private int unboardedPassengers;
    private boolean boardingOpen = true;
    private boolean rideInProgress;
    private boolean unboardingOpen;

    public RollerCoasterSimulation(RollerCoasterConfig config) {
        this.config = config;
    }

    public void start() throws InterruptedException {
        validateConfig();

        ExecutorService executorService = Executors.newFixedThreadPool(config.passengerCount() + 1);
        Runtime.getRuntime().addShutdownHook(new Thread(() -> shutdown(executorService)));


        executorService.submit(this::runCar);
        for (int passengerId = 1; passengerId <= config.passengerCount(); passengerId++) {
            int finalPassengerId = passengerId;
            executorService.submit(() -> runPassenger(finalPassengerId));
        }

        try {
            executorService.awaitTermination(Long.MAX_VALUE, TimeUnit.DAYS);
        } finally {
            shutdown(executorService);
        }
    }

    private void validateConfig() {
        if (config.carCapacity() <= 0) {
            throw new IllegalArgumentException("carCapacity must be greater than zero");
        }
        if (config.passengerCount() < config.carCapacity()) {
            throw new IllegalArgumentException("passengerCount must be at least carCapacity");
        }
    }


    private void runCar() {
        try {
            while (!stopRequested) {
                int round = waitUntilCarIsFull();
                if (round == -1) {
                    return;
                }

                TimeUnit.MILLISECONDS.sleep(config.rideDurationMillis());
                System.out.printf("[car] round %d ride finished%n", round);

                openDoorsForUnboarding(round);
                waitUntilAllPassengersLeave(round);
            }
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
        }
    }

    private int waitUntilCarIsFull() throws InterruptedException {
        lock.lock();
        try {
            while (!stopRequested && boardedPassengers < config.carCapacity()) {
                carCanDepart.await();
            }

            if (stopRequested) {
                return -1;
            }

            boardingOpen = false;
            rideInProgress = true;
            System.out.printf("[car] round %d departing with %d passengers%n", currentRound, boardedPassengers);
            return currentRound;
        } finally {
            lock.unlock();
        }
    }

    private void openDoorsForUnboarding(int round) {
        lock.lock();
        try {
            rideInProgress = false;
            unboardingOpen = true;
            unloadingRound = round;
            System.out.printf("[car] round %d doors open for unboarding%n", round);
            unboardingAllowed.signalAll();
        } finally {
            lock.unlock();
        }
    }

    private void waitUntilAllPassengersLeave(int round) throws InterruptedException {
        lock.lock();
        try {
            while (!stopRequested && currentRound == round) {
                rideCompleted.await();
            }
        } finally {
            lock.unlock();
        }
    }

    private void runPassenger(int passengerId) {
        try {
            while (!stopRequested) {
                int boardedRound = board(passengerId);
                if (boardedRound == -1) {
                    return;
                }

                waitForRideToFinish(passengerId, boardedRound);
                unboard(passengerId, boardedRound);
                TimeUnit.MILLISECONDS.sleep(config.boardingDelayMillis());
            }
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
        }
    }

    private int board(int passengerId) throws InterruptedException {
        lock.lock();
        try {
            while (!stopRequested && (!boardingOpen || rideInProgress || boardedPassengers == config.carCapacity())) {
                boardingAllowed.await();
            }

            if (stopRequested) {
                return -1;
            }

            int round = currentRound;
            boardedPassengers++;
            System.out.printf(
                    "[passenger-%d] boarded for round %d (%d/%d)%n",
                    passengerId,
                    round,
                    boardedPassengers,
                    config.carCapacity()
            );

            if (boardedPassengers == config.carCapacity()) {
                System.out.printf("[passenger-%d] filled the car for round %d%n", passengerId, round);
                carCanDepart.signal();
            }

            return round;
        } finally {
            lock.unlock();
        }
    }

    private void waitForRideToFinish(int passengerId, int boardedRound) throws InterruptedException {
        lock.lock();
        try {
            while (!stopRequested && (!unboardingOpen || unloadingRound != boardedRound)) {
                unboardingAllowed.await();
            }

            if (!stopRequested) {
                System.out.printf("[passenger-%d] ride over in round %d%n", passengerId, boardedRound);
            }
        } finally {
            lock.unlock();
        }
    }

    private void unboard(int passengerId, int boardedRound) throws InterruptedException {
        TimeUnit.MILLISECONDS.sleep(config.disembarkDelayMillis());

        lock.lock();
        try {
            if (stopRequested || !unboardingOpen || unloadingRound != boardedRound) {
                return;
            }

            unboardedPassengers++;
            System.out.printf(
                    "[passenger-%d] unboarded from round %d (%d/%d)%n",
                    passengerId,
                    boardedRound,
                    unboardedPassengers,
                    config.carCapacity()
            );

            if (unboardedPassengers == config.carCapacity()) {
                System.out.printf("[car] round %d cleared. Boarding reopened for next group%n", boardedRound);
                boardedPassengers = 0;
                unboardedPassengers = 0;
                unboardingOpen = false;
                boardingOpen = true;
                currentRound++;
                boardingAllowed.signalAll();
                rideCompleted.signalAll();
            }
        } finally {
            lock.unlock();
        }
    }

    private void shutdown(ExecutorService executorService) {
        requestStop();
        executorService.shutdownNow();
        System.out.println("Shutdown requested. Stopping roller coaster simulation...");
    }

    private void requestStop() {
        lock.lock();
        try {
            stopRequested = true;
            boardingAllowed.signalAll();
            carCanDepart.signalAll();
            unboardingAllowed.signalAll();
            rideCompleted.signalAll();
        } finally {
            lock.unlock();
        }
    }
}

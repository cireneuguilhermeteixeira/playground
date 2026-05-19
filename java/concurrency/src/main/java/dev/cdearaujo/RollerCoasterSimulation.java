package dev.cdearaujo;

import java.util.concurrent.TimeUnit;

public class RollerCoasterSimulation {

    private final RollerCoasterConfig config;

    public RollerCoasterSimulation(RollerCoasterConfig config) {
        this.config = config;
    }

    public void start() throws InterruptedException {
        Runtime.getRuntime().addShutdownHook(new Thread(() ->
                System.out.println("Shutdown requested. Stopping roller coaster simulation...")));

        printConstraints();
        System.out.println("Simulation bootstrap complete.");
        System.out.println("Car capacity configured as: " + config.carCapacity());
        System.out.println("Synchronization logic not implemented yet.");
        System.out.println("Application will keep running until you stop it manually.");

        while (true) {
            System.out.println("Roller coaster simulation placeholder loop is active...");
            TimeUnit.SECONDS.sleep(3);
        }
    }

    private void printConstraints() {
        System.out.println("Operating Systems Problem: Roller Coaster");
        System.out.println("Constraints:");
        System.out.println("1. Car Capacity: The car can only depart when it is completely full (exactly C passengers on board).");
        System.out.println("2. Departure: Passengers cannot board while the car is in motion.");
        System.out.println("3. End of the Ride: The car cannot end the ride until all C passengers are seated.");
        System.out.println("4. Disembarkation: The car can only open its doors and allow a new group to board when all C passengers from the previous round have disembarked.");
    }

    /*
     * Constraints for the future synchronization implementation:
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
}

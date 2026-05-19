package dev.cdearaujo;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class RollerCoasterSimulation {

    private final RollerCoasterConfig config;

    public RollerCoasterSimulation(RollerCoasterConfig config) {
        this.config = config;
    }

    public void start() throws InterruptedException {
        validateConfig();

        RollerCoasterCoordinator coordinator = new RollerCoasterCoordinator(config);
        ExecutorService executorService = Executors.newFixedThreadPool(config.passengerCount() + 1);
        Runtime.getRuntime().addShutdownHook(new Thread(() -> shutdown(coordinator, executorService)));

        executorService.submit(new Car(coordinator));
        for (int passengerId = 1; passengerId <= config.passengerCount(); passengerId++) {
            executorService.submit(new Passenger(passengerId, coordinator));
        }

        try {
            executorService.awaitTermination(Long.MAX_VALUE, TimeUnit.DAYS);
        } finally {
            shutdown(coordinator, executorService);
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

    private void shutdown(RollerCoasterCoordinator coordinator, ExecutorService executorService) {
        coordinator.requestStop();
        executorService.shutdownNow();
        System.out.println("Shutdown requested. Stopping roller coaster simulation...");
    }
}

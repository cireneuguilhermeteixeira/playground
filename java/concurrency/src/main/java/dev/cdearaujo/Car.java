package dev.cdearaujo;

public class Car implements Runnable {

    private final RollerCoasterCoordinator coordinator;

    public Car(RollerCoasterCoordinator coordinator) {
        this.coordinator = coordinator;
    }

    @Override
    public void run() {
        try {
            while (!coordinator.isStopRequested()) {
                int round = coordinator.awaitFullCarAndDepart();
                if (round == -1) {
                    return;
                }

                coordinator.simulateRide(round);
                coordinator.openDoorsForUnboarding(round);
                coordinator.awaitAllPassengersLeave(round);
            }
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
        }
    }
}

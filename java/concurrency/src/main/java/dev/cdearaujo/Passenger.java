package dev.cdearaujo;

public class Passenger implements Runnable {

    private final int passengerId;
    private final RollerCoasterCoordinator coordinator;

    public Passenger(int passengerId, RollerCoasterCoordinator coordinator) {
        this.passengerId = passengerId;
        this.coordinator = coordinator;
    }

    @Override
    public void run() {
        try {
            while (!coordinator.isStopRequested()) {
                int boardedRound = coordinator.boardPassenger(passengerId);
                if (boardedRound == -1) {
                    return;
                }

                coordinator.awaitRideOver(passengerId, boardedRound);
                coordinator.unboardPassenger(passengerId, boardedRound);
                coordinator.pauseBeforeNextBoarding();
            }
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
        }
    }
}

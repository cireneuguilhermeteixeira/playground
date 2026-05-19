package dev.cdearaujo;

public class RollerCoasterProblemApp {

    public static void main(String[] args) throws InterruptedException {
        RollerCoasterConfig config = new RollerCoasterConfig(
                4,
                8,
                250,
                1_500,
                200
        );
        RollerCoasterSimulation simulation = new RollerCoasterSimulation(config);

        simulation.start();
    }
}

package dev.cdearaujo;

import java.util.concurrent.TimeUnit;

public class RollerCoasterProblemApp {

    public static void main(String[] args) throws InterruptedException {
        RollerCoasterConfig config = new RollerCoasterConfig(4);
        RollerCoasterSimulation simulation = new RollerCoasterSimulation(config);

        simulation.start();
    }
}

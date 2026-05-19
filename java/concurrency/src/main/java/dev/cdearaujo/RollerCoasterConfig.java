package dev.cdearaujo;

public record RollerCoasterConfig(
        int carCapacity,
        int passengerCount,
        long boardingDelayMillis,
        long rideDurationMillis,
        long disembarkDelayMillis
) {
}

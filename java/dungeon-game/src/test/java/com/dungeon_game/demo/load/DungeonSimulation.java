package com.dungeon_game.demo.load;


import static io.gatling.javaapi.core.CoreDsl.*;
import static io.gatling.javaapi.http.HttpDsl.*;

import io.gatling.javaapi.core.*;
import io.gatling.javaapi.http.*;

import java.util.Random;

public class DungeonSimulation extends Simulation {

    // -------- Config --------
    // Override at runtime: -DBASE_URL=http://localhost:8080
    private static final String BASE_URL = System.getProperty("BASE_URL", "http://localhost:8080");

    // choose sizes & probabilities
    private static final int ROWS = Integer.getInteger("ROWS", 20);
    private static final int COLS = Integer.getInteger("COLS", 20);
    private static final int MIN_VAL = Integer.getInteger("MIN_VAL", -10);
    private static final int MAX_VAL = Integer.getInteger("MAX_VAL", 10);

    private static final Random RND = new Random();

    // Shared bucket of IDs created by POST to later hit GET /runs/{id}
    private static final java.util.concurrent.ConcurrentLinkedQueue<String> IDS = new java.util.concurrent.ConcurrentLinkedQueue<>();

    // Build a random board JSON (small negatives/positives)
    private static String randomBoardJson() {
        StringBuilder sb = new StringBuilder();
        sb.append("{\"dungeon\":[");
        for (int r = 0; r < ROWS; r++) {
            if (r > 0) sb.append(",");
            sb.append("[");
            for (int c = 0; c < COLS; c++) {
                if (c > 0) sb.append(",");
                int v = MIN_VAL + RND.nextInt(MAX_VAL - MIN_VAL + 1);
                sb.append(v);
            }
            sb.append("]");
        }
        sb.append("]}");
        return sb.toString();
    }

    private final HttpProtocolBuilder httpProtocol =
            http.baseUrl(BASE_URL)
                    .contentTypeHeader("application/json")
                    .acceptHeader("application/json");

    // ----- Write (POST) scenario -----
    private final ScenarioBuilder writeScenario =
            scenario("Write/POST min-hp")
                    .exec(
                            http("POST /dungeon/min-hp")
                                    .post("/dungeon/min-hp")
                                    .body(StringBody(session -> randomBoardJson()))
                                    .check(status().is(200))
                                    .check(jsonPath("$.id").saveAs("id"))
                    )
                    .exec(session -> {
                        String id = session.getString("id");
                        if (id != null) IDS.add(id);
                        return session;
                    });

    // ----- Read (GET) scenario -----
    private final ScenarioBuilder readScenario =
            scenario("Read/GET runs & run by id")
                    .randomSwitch()
                    // 70%: GET /dungeon/runs
                    .on(
                            new Choice.WithWeight(70, CoreDsl.exec(
                                    HttpDsl.http("GET /dungeon/runs")
                                            .get("/dungeon/runs")
                                            .check(HttpDsl.status().is(200))
                            )),
                            new Choice.WithWeight(30, exec(session -> {
                                        String id = IDS.peek();
                                        if (id != null) session = session.set("idForGet", id);
                                        else session = session.markAsFailed();
                                        return session;
                                    })
                                            .doIf(session -> session.contains("idForGet")).then(
                                                    exec(
                                                            http("GET /dungeon/runs/{id}")
                                                                    .get(s -> "/dungeon/runs/" + s.getString("idForGet"))
                                                                    .check(status().in(200, 404))
                                                    )
                                            )
                            )
                    );

    {
        setUp(
                // write path: ramp arrivals, small spike
                writeScenario.injectOpen(
                        rampUsersPerSec(1).to(50).during(30),
                        constantUsersPerSec(50).during(30),
                        rampUsersPerSec(50).to(100).during(20),
                        constantUsersPerSec(20).during(10)
                ).protocols(httpProtocol),

                // read path: constant high rate, starts slightly later
                readScenario.injectOpen(
                        nothingFor(10),
                        constantUsersPerSec(80).during(120)
                ).protocols(httpProtocol)
        )
                // SLO-like assertions (tune to your goals)
                .assertions(
                        global().responseTime().percentile4().lt(800),
                        global().failedRequests().percent().lt(2.0)
                );
    }
}


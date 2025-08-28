package com.dungeon_game.demo.load;

import static io.gatling.javaapi.core.CoreDsl.*;
import static io.gatling.javaapi.http.HttpDsl.*;

import io.gatling.javaapi.core.*;
import io.gatling.javaapi.http.*;

import java.util.Random;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicLong;

// >>> Prometheus Pushgateway
import io.prometheus.client.CollectorRegistry;
import io.prometheus.client.Counter;
import io.prometheus.client.Gauge;
import io.prometheus.client.exporter.PushGateway;

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
    private static final ConcurrentLinkedQueue<String> IDS = new ConcurrentLinkedQueue<>();

    // >>> Config do Pushgateway
    private static final String PUSHGATEWAY_URL = System.getProperty("PUSHGATEWAY_URL", "http://localhost:9091");
    private static final String PUSH_JOB        = System.getProperty("PUSH_JOB", "gatling_tests");
    private static final String SIM_TAG         = System.getProperty("SIMULATION_TAG", "DungeonSimulation");

    // >>> Agregador simples de métricas do run
    private static final RunAggregator AGG = new RunAggregator();

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
            .exec(session -> { AGG.markStartIfFirst(); return session; }) // >>> marca início do run
            .exec(
                http("POST /dungeon/min-hp")
                    .post("/dungeon/min-hp")
                    .body(StringBody(_ -> randomBoardJson()))
                    .check(status().is(200))
                    // >>> capturar tempo de resposta
                    .check(responseTimeInMillis().saveAs("rt"))
                    // >>> capturar id para futuros GETs
                    .check(jsonPath("$.id").saveAs("id"))
            )
            .exec(session -> {
                String id = session.getString("id");
                if (id != null) IDS.add(id);
                // >>> update aggregator (OK/KO + tempos)
                long rt = session.contains("rt") ? session.getLong("rt") : -1L;
                if (session.isFailed()) {
                    AGG.addKo(rt);
                } else {
                    AGG.addOk(rt);
                }
                return session;
            });

    // ----- Read (GET) scenario -----
    private final ScenarioBuilder readScenario =
        scenario("Read/GET runs & run by id")
            .exec(session -> { AGG.markStartIfFirst(); return session; }) // >>> marca início do run
            .randomSwitch()
            .on(
                new Choice.WithWeight(70, exec(
                    http("GET /dungeon/runs")
                        .get("/dungeon/runs")
                        .check(status().is(200))
                        .check(responseTimeInMillis().saveAs("rt"))
                ).exec(session -> {
                    long rt = session.contains("rt") ? session.getLong("rt") : -1L;
                    if (session.isFailed()) AGG.addKo(rt); else AGG.addOk(rt);
                    return session;
                })),
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
                                .check(responseTimeInMillis().saveAs("rt"))
                        ).exec(session -> {
                            long rt = session.contains("rt") ? session.getLong("rt") : -1L;
                            if (session.isFailed()) AGG.addKo(rt); else AGG.addOk(rt);
                            return session;
                        })
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
        .assertions(
            global().responseTime().percentile4().lt(800),
            global().failedRequests().percent().lt(2.0)
        );
    }

    // >>> Function to push aggregated metrics to Pushgateway
    private static void pushToPushgateway(RunAggregator m) throws Exception {
        CollectorRegistry registry = new CollectorRegistry();

        Counter ok = Counter.build().name("gatling_requests_ok_total")
            .help("Total de requests OK na execução").register(registry);
        Counter ko = Counter.build().name("gatling_requests_ko_total")
            .help("Total de requests KO na execução").register(registry);

        Gauge meanRt = Gauge.build().name("gatling_mean_response_time_ms")
            .help("Tempo de resposta médio (ms)").register(registry);
        Gauge maxRt = Gauge.build().name("gatling_max_response_time_ms")
            .help("Tempo de resposta máximo (ms)").register(registry);
        Gauge rps = Gauge.build().name("gatling_requests_per_second")
            .help("Requests por segundo (média do run)").register(registry);
        Gauge durationSec = Gauge.build().name("gatling_run_duration_seconds")
            .help("Duração total da execução (s)").register(registry);
        Gauge totalReq = Gauge.build().name("gatling_total_requests")
            .help("Total de requests (OK + KO)").register(registry);
        Gauge runSuccess = Gauge.build().name("gatling_run_success")
            .help("1=sem falhas (KO=0), 0=c/ falhas").register(registry);

        ok.inc(m.ok.get());
        ko.inc(m.ko.get());
        meanRt.set(m.meanMillis());
        maxRt.set(m.maxRt.get());
        rps.set(m.rps());
        durationSec.set(m.durationSeconds());
        totalReq.set(m.total());
        runSuccess.set(m.ko.get() == 0 ? 1 : 0);

        // Labels of grouping in Pushgateway
        var grouping = new java.util.HashMap<String, String>();
        grouping.put("simulation", SIM_TAG);
        grouping.put("base_url", BASE_URL);

        // Allow to tag by commit/environment/host
        String env = System.getenv().getOrDefault("ENV", "local");
        String commit = System.getenv().getOrDefault("GIT_COMMIT", "dev");
        String instance = System.getenv().getOrDefault("HOSTNAME", "local");
        grouping.put("env", env);
        grouping.put("commit", commit);
        grouping.put("instance", instance);

        PushGateway pg = new PushGateway(PUSHGATEWAY_URL);
        pg.pushAdd(registry, PUSH_JOB, grouping);

        System.out.printf(
            "[Pushgateway] OK=%d KO=%d mean=%.2fms max=%dms rps=%.2f dur=%.1fs%n",
            m.ok.get(), m.ko.get(), m.meanMillis(), m.maxRt.get(), m.rps(), m.durationSeconds()
        );
    }

    // >>> Simple aggregator ( incremental media + max + duration)
    private static class RunAggregator {
        final AtomicLong ok = new AtomicLong();
        final AtomicLong ko = new AtomicLong();
        final AtomicLong sumRt = new AtomicLong();
        final AtomicLong countRt = new AtomicLong();
        final AtomicLong maxRt = new AtomicLong();
        volatile long startNano = 0L;
        volatile long endNano = 0L;

        void markStartIfFirst() {
            if (startNano == 0L) {
                synchronized (this) {
                    if (startNano == 0L) startNano = System.nanoTime();
                }
            }
        }

        void markEnd() {
            endNano = System.nanoTime();
        }

        void addOk(long rtMillis) {
            ok.incrementAndGet();
            addRt(rtMillis);
        }

        void addKo(long rtMillis) {
            ko.incrementAndGet();
            addRt(rtMillis);
        }

        private void addRt(long rtMillis) {
            if (rtMillis >= 0) {
                sumRt.addAndGet(rtMillis);
                countRt.incrementAndGet();
                // update max
                long prev;
                do {
                    prev = maxRt.get();
                    if (rtMillis <= prev) break;
                } while (!maxRt.compareAndSet(prev, rtMillis));
            }
        }

        double meanMillis() {
            long c = countRt.get();
            return c == 0 ? 0.0 : ((double) sumRt.get()) / c;
            // Note: p95/p99 need a estimator (HDRHistogram/TDigest).
        }

        long total() { return ok.get() + ko.get(); }

        double durationSeconds() {
            long e = (endNano == 0L ? System.nanoTime() : endNano);
            long s = (startNano == 0L ? e : startNano);
            return (e - s) / 1_000_000_000.0;
        }

        double rps() {
            double dur = durationSeconds();
            return dur > 0 ? total() / dur : 0.0;
        }
    }

    @Override
    public void after() {
        try {
            // close the metric window and publish
            AGG.markEnd();
            pushToPushgateway(AGG);
        } catch (Exception e) {
            System.err.println("[Pushgateway] Error trying to send  metrics: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

use portcheck::free_local_port;
use reqwest::StatusCode;
use std::process::Command;
use std::{thread, time::Duration};

/// Fixed container name & fixed port to simulate classic docker-compose habits.
const CT_NAME: &str = "demo_redis_flaky";
const REDIS_IMAGE: &str = "redis:7-alpine";
const FIXED_PORT: u16 = 6379;

fn docker(args: &[&str]) -> std::process::Output {
    Command::new("docker").args(args).output().expect("docker not found / failed")
}

fn ensure_flaky_container_once() {
    // Start only if not already up. Fixed port + no cleanup → stale state across runs.
    let ps = docker(&["ps", "-a", "--format", "{{.Names}}"]);
    let list = String::from_utf8_lossy(&ps.stdout);
    if !list.lines().any(|n| n.trim() == CT_NAME) {
        // pull and run on fixed port
        let _ = docker(&["pull", REDIS_IMAGE]);
        let run = docker(&[
            "run","-d",
            "--name", CT_NAME,
            "-p", &format!("{FIXED_PORT}:6379"),
            REDIS_IMAGE,
        ]);
        assert!(run.status.success(), "failed to start redis container");
        // give Redis a moment
        std::thread::sleep(Duration::from_secs(2));
    } else {
        // if it's "exited", start it; otherwise leave it running with its stale data
        let _ = docker(&["start", CT_NAME]);
        std::thread::sleep(Duration::from_secs(1));
    }
}

#[tokio::test]
async fn flaky_suite_without_testcontainers() {
    // Intentionally fixed port; if already in use, this mimics the 'bind' headache
    if !free_local_port(FIXED_PORT) {
        eprintln!("Port {FIXED_PORT} already in use – this is the kind of collision we're illustrating.");
    }

    ensure_flaky_container_once();

    // Start our API server against the fixed Redis
    let redis_url = format!("redis://127.0.0.1:{FIXED_PORT}");
    let (addr, shutdown) = redis_api_demo::start_server(&redis_url).await.unwrap();

    let client = reqwest::Client::new();
    let base = format!("http://{}", addr);

    // We expect DB to be empty at the start.
    // First run: passes. Second run: FAILS because stale key is still there.
    let k = "foo";

    // We check it's missing
    let res = client
        .get(format!("{base}/get?key={k}"))
        .send()
        .await
        .unwrap();

    assert_eq!(
        res.status(),
        StatusCode::NOT_FOUND,
        "Expected empty DB at start, but found value (stale data!)"
    );

    // Now set the value and verify
    let res = client
        .post(format!("{base}/set?key={k}&value=bar"))
        .send()
        .await
        .unwrap();
    assert!(res.status().is_success());

    let res = client
        .get(format!("{base}/get?key={k}"))
        .send()
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);

    // Do NOT clean up the Redis container on purpose.
    // This simulates teams forgetting teardown → second run sees leftover key.

    // shut server
    let _ = shutdown.send(());
    // tiny wait so server can shut down gracefully
    tokio::time::sleep(Duration::from_millis(200)).await;
}

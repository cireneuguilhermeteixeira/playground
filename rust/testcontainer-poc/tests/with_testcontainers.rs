use reqwest::StatusCode;
use std::time::Duration;
use testcontainers::{
    core::{ContainerPort, WaitFor},
    runners::AsyncRunner,
    GenericImage,
};

#[tokio::test]
async fn stable_suite_with_testcontainers() {
    let image = GenericImage::new("redis", "7-alpine")
        .with_exposed_port(ContainerPort::Tcp(6379))
        .with_wait_for(WaitFor::message_on_stdout("Ready to accept connections"));

    // `SyncRunner` is convenient in tests; it tears down on drop.
    let container = image.start().await.expect("failed to start redis");

    // Map the random host port to the container's 6379
    let host = container.get_host().await.expect("host").to_string();
    let port = container.get_host_port_ipv4(6379).await.expect("port");

    let redis_url = format!("redis://{host}:{port}");
    
    // Start our API server pointing to THIS fresh Redis
    let (addr, shutdown) = redis_api_demo::start_server(&redis_url).await.unwrap();

    let client = reqwest::Client::new();
    let base = format!("http://{}", addr);
    let k = "foo";

    // Always starts empty because it's a brand-new container
    let res = client.get(format!("{base}/get?key={k}")).send().await.unwrap();
    assert_eq!(res.status(), StatusCode::NOT_FOUND);

    // Set and verify
    let res = client.post(format!("{base}/set?key={k}&value=bar")).send().await.unwrap();
    assert!(res.status().is_success());

    let res = client.get(format!("{base}/get?key={k}")).send().await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);

    // Shutdown server; container will auto-teardown when dropped at end of test.
    let _ = shutdown.send(());
    tokio::time::sleep(Duration::from_millis(200)).await;
}

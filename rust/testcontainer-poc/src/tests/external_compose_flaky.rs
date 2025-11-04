use reqwest::StatusCode;

#[tokio::test]
async fn external_compose_flaky() {
    let base = std::env::var("APP_BASE").unwrap_or_else(|_| "http://127.0.0.1:8080".to_string());
    let client = reqwest::Client::new();

    let k = "foo";

    let res = client
        .get(format!("{base}/get?key={k}"))
        .send()
        .await
        .expect("failed to reach app");
    assert_eq!(
        res.status(),
        StatusCode::NOT_FOUND,
        "Expected empty DB at start, but found a value (stale data due to Compose volume)"
    );

    // Set e valida
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
}

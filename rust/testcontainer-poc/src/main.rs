use redis_api_demo::build_app;
use std::{env, net::SocketAddr};
use tokio::signal;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let redis_url = env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1:6379".to_string());
    let port: u16 = env::var("PORT").ok().and_then(|s| s.parse().ok()).unwrap_or(8080);
    let addr: SocketAddr = ([0, 0, 0, 0], port).into();

    let app = build_app(&redis_url).await?;
    println!("Starting on http://{addr}  (REDIS_URL={redis_url})");

    let listener = tokio::net::TcpListener::bind(addr).await?;
    let server = axum::serve(listener, app.into_make_service());

    tokio::select! {
        _ = server => {},
        _ = signal::ctrl_c() => {},
    }

    Ok(())
}
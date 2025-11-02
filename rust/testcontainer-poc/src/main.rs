use redis_api_demo::start_server;
use std::env;
use tokio::signal;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let redis_url = env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1:6379".to_string());
    let (addr, _shutdown) = start_server(&redis_url).await?;
    println!("Listening on http://{addr}  (REDIS_URL={redis_url})");
    // Keep running until Ctrl+C
    signal::ctrl_c().await?;
    Ok(())
}
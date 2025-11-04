use axum::{
    extract::{Query, State},
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use redis::{AsyncCommands, Client};
use serde::Deserialize;
use std::{net::SocketAddr, sync::Arc};
use thiserror::Error;
use tokio::net::TcpListener;
use tracing::info;
use tracing_subscriber::EnvFilter;

#[derive(Clone)]
pub struct AppState {
    pub redis: Arc<Client>,
}

#[derive(Error, Debug)]
pub enum AppError {
    #[error("redis error: {0}")]
    Redis(#[from] redis::RedisError),
    #[error("internal error: {0}")]
    Other(#[from] anyhow::Error),
}

impl From<AppError> for (StatusCode, String) {
    fn from(err: AppError) -> Self {
        (StatusCode::INTERNAL_SERVER_ERROR, err.to_string())
    }
}

#[derive(Deserialize)]
pub struct KV {
    key: String,
    value: Option<String>,
}

async fn set_kv(State(state): State<AppState>, Query(KV { key, value }): Query<KV>) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    let value = value.ok_or_else(|| (StatusCode::BAD_REQUEST, "missing value".to_string()))?;
    let mut con = state.redis.get_multiplexed_async_connection().await.map_err::<(StatusCode, String), _>(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    con.set::<_, _, ()>(key.clone(), value.clone()).await.map_err::<(StatusCode, String), _>(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    Ok(Json(serde_json::json!({ "ok": true })))
}

async fn get_kv(State(state): State<AppState>, Query(KV { key, .. }): Query<KV>) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    let mut con = state.redis.get_multiplexed_async_connection().await.map_err::<(StatusCode, String), _>(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    let val: Option<String> = con.get(key.clone()).await.map_err::<(StatusCode, String), _>(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    match val {
        Some(v) => Ok(Json(serde_json::json!({ "value": v }))),
        None => Err((StatusCode::NOT_FOUND, "not found".into())),
    }
}

pub async fn build_app(redis_url: &str) -> anyhow::Result<Router> {
    let client = Client::open(redis_url)?;
    let state = AppState { redis: Arc::new(client) };

    let app = Router::new()
        .route("/set", post(set_kv))
        .route("/get", get(get_kv))
        .with_state(state);

    Ok(app)
}

/// Starts the server bound to an ephemeral port (port 0).
/// Returns the bound addr (including the chosen port) and the shutdown handle.
/// Call `shutdown_tx.send(())` to stop the server.
pub async fn start_server(redis_url: &str) -> anyhow::Result<(SocketAddr, tokio::sync::oneshot::Sender<()>)> {
    let _ = tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::try_new("info").unwrap_or_else(|_| EnvFilter::new("info")))
        .with_target(false)
        .try_init();

    let app = build_app(redis_url).await?;
    let listener = TcpListener::bind(("127.0.0.1", 0)).await?;
    let addr = listener.local_addr()?;

    let (shutdown_tx, shutdown_rx) = tokio::sync::oneshot::channel::<()>();
    let server = axum::serve(listener, app.into_make_service());

    tokio::spawn(async move {
        let _ = server
            .with_graceful_shutdown(async move {
                let _ = shutdown_rx.await;
            })
            .await;
    });

    info!("server started at http://{}", addr);
    Ok((addr, shutdown_tx))
}

# Build
FROM rust:1.81 as builder
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
# cache deps
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
# real sources
COPY . .
RUN cargo build --release

# Runtime (tiny)
FROM gcr.io/distroless/cc-debian12
WORKDIR /app
ENV RUST_LOG=info
ENV PORT=8080
COPY --from=builder /app/target/release/redis_api_demo /app/redis_api_demo
EXPOSE 8080
ENTRYPOINT ["/app/redis_api_demo"]

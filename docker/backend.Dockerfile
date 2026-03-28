# SNIP-36 Prover Backend
# Multi-stage build: builder (Rust + Python + deps) → slim runtime
#
# Build: docker build -f docker/backend.Dockerfile -t snip36-backend ../snip36prover
# Run:   docker run --env-file .env -p 8090:8090 snip36-backend

# ── Stage 1: Builder ────────────────────────────────────
FROM rust:1.87-bookworm AS builder

# System deps
RUN apt-get update && apt-get install -y \
    git curl python3.12 python3.12-venv python3-pip \
    pkg-config libssl-dev clang cmake \
    && rm -rf /var/lib/apt/lists/*

# Install Rust nightly (required for stwo prover + sequencer)
RUN rustup toolchain install nightly-2025-07-14 \
    && rustup component add rust-src --toolchain nightly-2025-07-14

# Install sncast + scarb
RUN curl -L https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/scripts/install.sh | sh \
    && /root/.local/bin/snfoundryup
RUN curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh

ENV PATH="/root/.local/bin:/root/.cargo/bin:${PATH}"

WORKDIR /app

# Copy source
COPY . .

# Build the server binary (stable toolchain)
RUN cargo build --release -p snip36-server -p snip36-cli

# Run setup to build external deps (stwo prover, virtual OS runner)
# This is the slowest step (~20-30 min) — cached in Docker layer
RUN ./target/release/snip36 setup

# Compile Cairo test contracts
RUN cd tests/contracts && scarb build

# ── Stage 2: Runtime ────────────────────────────────────
FROM debian:bookworm-slim AS runtime

RUN apt-get update && apt-get install -y \
    ca-certificates libssl3 python3.12 python3.12-venv curl git \
    && rm -rf /var/lib/apt/lists/*

# Install sncast (needed at runtime for deploy/invoke)
RUN curl -L https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/scripts/install.sh | sh \
    && /root/.local/bin/snfoundryup
RUN curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh

ENV PATH="/root/.local/bin:/root/.cargo/bin:${PATH}"

WORKDIR /app

# Copy built binaries
COPY --from=builder /app/target/release/snip36-server /app/bin/snip36-server
COPY --from=builder /app/target/release/snip36 /app/bin/snip36

# Copy external deps (prover, runner, bootloader)
COPY --from=builder /app/deps/bin/ /app/deps/bin/
COPY --from=builder /app/deps/sequencer/target/release/starknet_os_runner /app/deps/sequencer/target/release/starknet_os_runner

# Copy Python venv (cairo-compile)
COPY --from=builder /app/sequencer_venv/ /app/sequencer_venv/

# Copy prover params and sample input
COPY --from=builder /app/sample-input/ /app/sample-input/

# Copy compiled Cairo contracts
COPY --from=builder /app/tests/contracts/ /app/tests/contracts/

# Output directory
RUN mkdir -p /app/output

ENV SNIP36_PROJECT_DIR=/app
ENV PORT=8090
ENV RUST_LOG=info

EXPOSE 8090

CMD ["/app/bin/snip36-server"]

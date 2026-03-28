# SNIP-36 CoinFlip Demo

Provably fair coin flip game on Starknet, powered by [SNIP-36 in-protocol proof verification](https://community.starknet.io/t/snip-36-in-protocol-proof-verification/116123).

Player bets STRK, the bank matches, a coin is flipped inside a SNIP-36 virtual block, and a STARK proof guarantees the result is honest. The winner gets paid on-chain — no trust required.

## Architecture

```
┌──────────────────┐     approve + deposit      ┌──────────────────────┐     match_deposit      ┌──────────────┐
│  Player Wallet   │ ─────────────────────────▶  │   CoinFlipBank       │ ◀──────────────────── │   Server     │
│  (ArgentX/       │                             │   (settlement        │                       │   (bank)     │
│   Braavos)       │ ◀───── 2x payout ───────── │    contract)         │ ──── settle() ──────▶ │              │
└──────────────────┘                             └──────────────────────┘                       └──────┬───────┘
                                                                                                       │
       ┌───────────────────────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────┐       ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  Virtual OS  │ ────▶ │ stwo Prover  │ ────▶ │   Gateway    │ ────▶ │  Starknet    │
│  (off-chain  │  PIE  │ (STARK proof │ proof │  (submit tx  │       │  (verify     │
│   execution) │       │  generation) │       │   + proof)   │       │   on-chain)  │
└─────────────┘       └──────────────┘       └──────────────┘       └──────────────┘
```

## Game Flow

1. **Connect wallet** — ArgentX or Braavos on Starknet Sepolia
2. **Choose side & amount** — Heads or tails, 0.1–100 STRK
3. **Commit** — Browser computes `pedersen(bet, nonce)` and sends the hash (bet stays hidden)
4. **Deposit** — Player signs approve + deposit multicall in wallet (one signature)
5. **Bank match** — Server matches the deposit from bank funds
6. **Prove** — Server executes `play(seed, player, bet)` in a SNIP-36 virtual block, generates a STARK proof via the stwo prover
7. **Submit** — Proof-bearing transaction submitted to Starknet
8. **Verify** — Starknet protocol verifies the proof on-chain
9. **Settle** — Settlement contract recomputes the deterministic outcome and pays the winner

## SNIP-36 Features Demonstrated

| Feature | How the game uses it |
|---|---|
| **Virtual blocks** | Coin flip executes off-chain with zero gas cost |
| **STARK proof verification** | stwo proof guarantees honest computation |
| **L2→L1 settlement messages** | Game result emitted as a provable message |
| **Proof facts in tx hash** | Proof is cryptographically bound to the game round |
| **Zero-fee virtual transactions** | Game logic costs nothing to execute during proving |
| **Commit-reveal fairness** | Neither player nor server can cheat |

### Why can't anyone cheat?

- **Player**: Bet is committed (hidden) before the seed is revealed
- **Server**: Seed is locked after the commitment; the STARK proof guarantees correct execution
- **Anyone**: The outcome `pedersen(block_number, player_address) % 2` is deterministic — anyone can verify it

## Smart Contracts

### CoinFlip (virtual execution)

Runs inside the SNIP-36 virtual block. Computes the deterministic coin flip and emits a settlement receipt as an L2→L1 message.

```cairo
fn play(seed: felt252, player: felt252, bet: felt252) {
    let hash = pedersen(seed, player);
    let outcome = if hash_u256.low % 2 == 0 { 0 } else { 1 };
    // Emit [player, seed, bet, outcome, won] as L2→L1 message
}
```

### CoinFlipBank (on-chain settlement)

Holds STRK deposits and pays the winner after the proof is verified.

- `deposit(session_id, amount, seed, bet)` — Player deposits STRK (after ERC20 approve)
- `match_deposit(session_id)` — Bank matches the player's deposit
- `settle(session_id)` — Recomputes outcome, credits winner's balance
- `withdraw()` — Player withdraws accumulated winnings

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- The [SNIP-36 prover backend](https://github.com/starknet-innovation/snip-36-prover-backend) running on port 8090
- A Starknet Sepolia wallet (ArgentX or Braavos) with some STRK

### Run locally

```bash
# 1. Clone
git clone https://github.com/adrienlacombe/snip36-ethcc.git
cd snip36-ethcc

# 2. Install
npm install

# 3. Start (backend must be running on port 8090)
npm run dev

# 4. Open http://localhost:5173
```

### Run with Docker

```bash
# 1. Clone both repos side by side
git clone https://github.com/starknet-innovation/snip-36-prover-backend ../snip36prover
git clone https://github.com/adrienlacombe/snip36-ethcc.git snip36-demo
cd snip36-demo

# 2. Configure
cp .env.example .env
# Edit .env with your RPC URL, account address, and private key

# 3. Run
docker compose up --build
# First build takes ~30 min (stwo prover compilation)
# Open http://localhost:3000
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Tailwind CSS v4 + Vite |
| Wallet | get-starknet-core (ArgentX / Braavos) |
| Crypto | starknet.js (Pedersen hash for commit-reveal) |
| Backend | Rust / Axum ([snip36-server](https://github.com/starknet-innovation/snip-36-prover-backend)) |
| Prover | stwo (Circle STARK) via SNIP-36 virtual OS |
| Contracts | Cairo 2.15.0 (CoinFlip + CoinFlipBank) |
| Chain | Starknet Sepolia |

## Project Structure

```
src/
  lib/              types, API client, constants
  hooks/            useWallet, useGameState, useCoinFlip
  components/
    game/           CoinAnimation, BetPanel, ResultCard, CoinFlipGame
    pipeline/       PipelineStep, PipelineVisualizer, LogTerminal
    education/      HowItWorks, ArchitectureDiagram, TechCard
    shared/         WalletButton, WalletPicker, TruncatedHash
  App.tsx           Main layout composing all sections
docker/             Dockerfiles + nginx config
```

## Links

- [SNIP-36 specification](https://community.starknet.io/t/snip-36-in-protocol-proof-verification/116123)
- [Prover backend](https://github.com/starknet-innovation/snip-36-prover-backend)
- [Starknet](https://www.starknet.io/)

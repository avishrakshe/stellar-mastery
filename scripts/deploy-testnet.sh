#!/usr/bin/env bash
# Soroban Testnet Contract Deployment Script for Level 3
set -e

echo "=== Building Soroban Contracts ==="
cd contracts/payment_vault
cargo build --target wasm32-unknown-unknown --release

cd ../agent_router
cargo build --target wasm32-unknown-unknown --release

cd ../..

echo "=== Deploying Contracts via Node Deployer ==="
node scripts/deploy.js

echo "=== Deployment Complete ==="

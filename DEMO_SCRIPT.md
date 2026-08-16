# 🎥 AgentPay Rails — 1 to 2 Minute Video Demo Script

**Project**: AgentPay Rails — Autonomous AI Agent Payment & Inter-Contract Infrastructure on Stellar & Soroban  
**Target Level**: Level 3 Submission  
**Target Duration**: 1 Minute 45 Seconds (1:45)

---

## 🎬 Video Recording Plan & Setup Checklist

Before recording:
1. Open [http://localhost:5173](http://localhost:5173) or your live Vercel URL in your browser.
2. Set screen recording resolution to **1080p (1920x1080)** or **4K**.
3. Ensure mouse cursor highlight/clicks are enabled.
4. Have your voiceover microphone ready or use screen recording software with audio (e.g., Loom, OBS Studio, QuickTime).

---

## 🎙️ Timestamped Video Script & Visual Walkthrough

### ⏱️ [0:00 – 0:20] Introduction & Multi-Wallet Authentication
**Visual Scene**:
- Display screen on the home tab showing the ambient starfield background and sleek glassmorphic header badge `Level 3 Production dApp`.
- Click on **"Connect Wallet / Select Agent"** button to open the Multi-Wallet Modal.
- Hover over Freighter, Albedo, and select **Agent Keypair Mode** (PricingAgent).

**Voiceover Script**:
> *"Welcome to AgentPay Rails — an autonomous AI agent payment and inter-contract infrastructure built on Stellar Testnet and Soroban for Level 3 submission.*
> 
> *Users can connect seamlessly using Freighter, Albedo, or pre-funded Agent Keypair Mode for autonomous machine-to-machine payments."*

---

### ⏱️ [0:20 – 0:50] Inter-Contract Soroban Execution (`AgentRouter` ➔ `PaymentVault`)
**Visual Scene**:
- Click on the **"⚡ Inter-Contract"** tab in the top navigation switcher.
- Point to the **Cross-Contract Call Topology** diagram: `Wallet` ➔ `AgentRouter` ➔ `PaymentVault`.
- Select `PricingAgent` and click **"⚡ Trigger Inter-Contract Execution"**.
- Show the loading indicator, the instant floating Toast Notification, and the returned transaction hash & CPU gas instruction telemetry.

**Voiceover Script**:
> *"Here in our Inter-Contract Execution Station, we demonstrate advanced Soroban smart contract logic.*
> 
> *When we trigger execution, the `AgentRouter` contract calls our `PaymentVault` contract on-chain using Soroban's cross-contract invocation — `env.invoke_contract()`. Notice the instant event pub-sub telemetry and verified transaction hash output!"*

---

### ⏱️ [0:50 – 1:15] Soroban Payment Vault Escrow Locking & Release
**Visual Scene**:
- Click on the **"🔒 Soroban Vault"** tab.
- Highlight the **Total Vault Value Locked** card (2,500.00 XLM).
- Fill in Escrow ID `105`, Amount `200 XLM`, click **"🔒 Deposit to Vault Escrow"**.
- View the floating success toast and updated locked balance.

**Voiceover Script**:
> *"Under the Soroban Vault tab, autonomous agents can lock funds into multi-party escrows. Funds are securely locked until job completion. We can also release escrows directly on-chain with single-click cryptographic verification."*

---

### 1:15 – 1:35 Real-Time Event Streaming & Multi-Recipient Batch Payments
**Visual Scene**:
- Switch to **"💸 Batch Composer"** tab.
- Click **"▶ Run Demo"** or submit a batch payment.
- Show the **Status Board** animating payment states from `Initiated` ➔ `Routed` ➔ `Settled`.
- Scroll down to the **Activity Feed** showing live Horizon SSE & Soroban contract event streams.

**Voiceover Script**:
> *"Our dApp features real-time payment lifecycle tracking — animating payments from Initiated to Routed to Settled. Events are streamed live via Horizon SSE and Soroban RPC into our reverse-chronological activity log."*

---

### 1:35 – 1:45 Conclusion, CI/CD & Test Suite
**Visual Scene**:
- Briefly show the GitHub repository tab or terminal output showing `11/11 Vitest tests passing` and `.github/workflows/ci.yml`.

**Voiceover Script**:
> *"Backed by 11 passing automated Vitest specs, Soroban Rust unit tests, and GitHub Actions CI/CD pipelines, AgentPay Rails is production-ready. Thank you!"*

---

## 📽️ Recommended Tools for Recording Your Video

1. **[Loom](https://www.loom.com)** (Recommended): Easiest tool to record screen + mic and generates an instant shareable link.
2. **[OBS Studio](https://obsproject.com)**: Free open-source tool for high-quality MP4/WebM recording.
3. **[CapCut](https://www.capcut.com) / Canva**: For quick trimming or adding background voiceover if preferred.

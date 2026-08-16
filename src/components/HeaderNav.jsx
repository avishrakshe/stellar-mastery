import React from "react";

export default function HeaderNav({ connectedWallet, onOpenWalletModal, activeTab, setActiveTab }) {
  return (
    <header className="site-header">
      <div className="container-main site-header__inner">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <a href="#" className="brand-logo">
            <span className="brand-logo__avatar">D</span>
            DeFi Agents
          </a>

          {/* Navigation Links */}
          <nav>
            <ul className="nav-links">
              <li>
                <span
                  className={`nav-link ${activeTab === "registry" ? "nav-link--active" : ""}`}
                  onClick={() => setActiveTab("registry")}
                >
                  Registry
                </span>
              </li>
              <li>
                <span
                  className={`nav-link ${activeTab === "activity" ? "nav-link--active" : ""}`}
                  onClick={() => setActiveTab("activity")}
                >
                  Activity
                </span>
              </li>
              <li>
                <span
                  className={`nav-link ${activeTab === "vault" ? "nav-link--active" : ""}`}
                  onClick={() => setActiveTab("vault")}
                >
                  Vault Escrow
                </span>
              </li>
              <li>
                <span
                  className={`nav-link ${activeTab === "intercontract" ? "nav-link--active" : ""}`}
                  onClick={() => setActiveTab("intercontract")}
                >
                  Inter-Contract
                </span>
              </li>
            </ul>
          </nav>
        </div>

        {/* Right Section: Orchestrator Pill & Connect Wallet */}
        <div className="header-right">
          <div className="orchestrator-pill">
            <span className="orchestrator-pill__dot" />
            <span>Testnet 99999</span>
            <span className="opacity-40">|</span>
            <span>Orchestrator {connectedWallet?.address ? `${connectedWallet.address.slice(0, 6)}...` : "0xF39F...2266"}</span>
            <span className="text-slate-900 font-semibold">10,000.00 XLM</span>
          </div>

          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            {connectedWallet?.type === "freighter" ? "Freighter Mode B Connected" : "Not connected (Mode A Active)"}
          </div>

          <button className="btn-primary-blue" onClick={onOpenWalletModal}>
            {connectedWallet?.type === "freighter" ? `👛 ${connectedWallet.name}` : "Connect Wallet"}
          </button>
        </div>
      </div>
    </header>
  );
}

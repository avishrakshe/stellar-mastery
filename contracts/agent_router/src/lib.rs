#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, vec, Address, Env, IntoVal, Symbol, Val};

#[contracttype]
pub enum RouterKey {
    VaultAddress,
    TotalRouted,
    BatchCount,
}

#[contract]
pub struct AgentRouter;

#[contractimpl]
impl AgentRouter {
    pub fn initialize(env: Env, vault_address: Address) {
        if env.storage().instance().has(&RouterKey::VaultAddress) {
            panic!("already initialized");
        }
        env.storage().instance().set(&RouterKey::VaultAddress, &vault_address);
        env.storage().instance().set(&RouterKey::TotalRouted, &0i128);
        env.storage().instance().set(&RouterKey::BatchCount, &0u32);
    }

    /// Inter-Contract Communication Endpoint:
    /// Routes AI Agent multi-recipient payments and invokes the PaymentVault contract via cross-contract call.
    pub fn route_and_deposit(
        env: Env,
        vault_address: Address,
        sender: Address,
        recipient: Address,
        amount: i128,
        escrow_id: i128,
    ) -> bool {
        sender.require_auth();

        if amount <= 0 {
            panic!("invalid amount");
        }

        // Cross-Contract Invocation to PaymentVault contract deposit method
        let deposit_fn = Symbol::new(&env, "deposit");
        let args: soroban_sdk::Vec<Val> = vec![
            &env,
            sender.to_val(),
            amount.into_val(&env),
            escrow_id.into_val(&env),
            recipient.to_val(),
        ];

        let vault_result: bool = env.invoke_contract(&vault_address, &deposit_fn, args);

        if vault_result {
            let current_total: i128 = env.storage().instance().get(&RouterKey::TotalRouted).unwrap_or(0);
            let current_batches: u32 = env.storage().instance().get(&RouterKey::BatchCount).unwrap_or(0);

            env.storage().instance().set(&RouterKey::TotalRouted, &(current_total + amount));
            env.storage().instance().set(&RouterKey::BatchCount, &(current_batches + 1));

            // Publish Inter-Contract Dispatch Event
            env.events().publish(
                (symbol_short!("router"), symbol_short!("dispatch")),
                (escrow_id, sender, recipient, amount),
            );
        }

        vault_result
    }

    pub fn get_router_stats(env: Env) -> (i128, u32) {
        let total: i128 = env.storage().instance().get(&RouterKey::TotalRouted).unwrap_or(0);
        let batches: u32 = env.storage().instance().get(&RouterKey::BatchCount).unwrap_or(0);
        (total, batches)
    }
}

#[cfg(test)]
mod test;

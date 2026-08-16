#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowRecord {
    pub depositor: Address,
    pub amount: i128,
    pub is_released: bool,
    pub recipient: Address,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Escrow(i128),
    TotalLocked,
}

#[contract]
pub struct PaymentVault;

#[contractimpl]
impl PaymentVault {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalLocked, &0i128);
    }

    pub fn deposit(env: Env, from: Address, amount: i128, escrow_id: i128, recipient: Address) -> bool {
        from.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }

        let escrow_key = DataKey::Escrow(escrow_id);
        if env.storage().persistent().has(&escrow_key) {
            panic!("escrow ID already exists");
        }

        let record = EscrowRecord {
            depositor: from.clone(),
            amount,
            is_released: false,
            recipient: recipient.clone(),
        };

        env.storage().persistent().set(&escrow_key, &record);

        let current_locked: i128 = env.storage().instance().get(&DataKey::TotalLocked).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalLocked, &(current_locked + amount));

        // Publish Soroban contract event
        env.events().publish(
            (symbol_short!("vault"), symbol_short!("deposit")),
            (escrow_id, from, recipient, amount),
        );

        true
    }

    pub fn release(env: Env, escrow_id: i128) -> bool {
        let escrow_key = DataKey::Escrow(escrow_id);
        let mut record: EscrowRecord = env
            .storage()
            .persistent()
            .get(&escrow_key)
            .expect("escrow record not found");

        if record.is_released {
            panic!("escrow already released");
        }

        record.is_released = true;
        env.storage().persistent().set(&escrow_key, &record);

        let current_locked: i128 = env.storage().instance().get(&DataKey::TotalLocked).unwrap_or(0);
        let new_locked = if current_locked >= record.amount {
            current_locked - record.amount
        } else {
            0
        };
        env.storage().instance().set(&DataKey::TotalLocked, &new_locked);

        // Publish Soroban release event
        env.events().publish(
            (symbol_short!("vault"), symbol_short!("release")),
            (escrow_id, record.recipient.clone(), record.amount),
        );

        true
    }

    pub fn get_escrow(env: Env, escrow_id: i128) -> Option<EscrowRecord> {
        env.storage().persistent().get(&DataKey::Escrow(escrow_id))
    }

    pub fn get_total_locked(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalLocked).unwrap_or(0)
    }
}

#[cfg(test)]
mod test;

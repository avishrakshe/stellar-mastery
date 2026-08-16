#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env};

// Import PaymentVault for unit test environment mocking
mod vault_contract {
    soroban_sdk::contractimport!(
        file = "../../contracts/payment_vault/target/wasm32-unknown-unknown/release/payment_vault.wasm"
    );
}

#[test]
fn test_inter_contract_routing() {
    let env = Env::default();
    env.mock_all_auths();

    // Register Vault contract
    let vault_contract_id = env.register_contract(None, payment_vault_mock::PaymentVaultMock);
    
    // Register Router contract
    let router_contract_id = env.register_contract(None, AgentRouter);
    let router_client = AgentRouterClient::new(&env, &router_contract_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    router_client.initialize(&vault_contract_id);

    let escrow_id = 901i128;
    let amount = 1000_0000000i128; // 1000 XLM

    let result = router_client.route_and_deposit(&vault_contract_id, &sender, &recipient, &amount, &escrow_id);
    assert!(result);

    let (total_routed, batches) = router_client.get_router_stats();
    assert_eq!(total_routed, amount);
    assert_eq!(batches, 1);
}

mod payment_vault_mock {
    use soroban_sdk::{contract, contractimpl, Address, Env};

    #[contract]
    pub struct PaymentVaultMock;

    #[contractimpl]
    impl PaymentVaultMock {
        pub fn deposit(_env: Env, _from: Address, _amount: i128, _escrow_id: i128, _recipient: Address) -> bool {
            true
        }
    }
}

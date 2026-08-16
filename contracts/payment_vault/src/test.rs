#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env};

#[test]
fn test_vault_deposit_and_release() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, PaymentVault);
    let client = PaymentVaultClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    client.initialize(&admin);

    let escrow_id = 101i128;
    let deposit_amount = 5000_0000000i128; // 500 XLM in stroops

    let success = client.deposit(&sender, &deposit_amount, &escrow_id, &recipient);
    assert!(success);

    assert_eq!(client.get_total_locked(), deposit_amount);

    let record = client.get_escrow(&escrow_id).unwrap();
    assert_eq!(record.depositor, sender);
    assert_eq!(record.recipient, recipient);
    assert_eq!(record.amount, deposit_amount);
    assert!(!record.is_released);

    let release_success = client.release(&escrow_id);
    assert!(release_success);

    assert_eq!(client.get_total_locked(), 0);
    let updated_record = client.get_escrow(&escrow_id).unwrap();
    assert!(updated_record.is_released);
}

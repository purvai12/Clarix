#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, vec, Address, Env, String, Symbol, Val, IntoVal, symbol_short};

#[contracttype]
pub enum DataKey {
    Report(Address, String), // reporter -> target_wallet -> report_hash
}

#[contract]
pub struct ClarixRegistry;

#[contractimpl]
impl ClarixRegistry {
    pub fn file_report(env: Env, reporter: Address, target_wallet: String, report_hash: String, reward_contract_id: Address) {
        reporter.require_auth();
        
        let key = DataKey::Report(reporter.clone(), target_wallet.clone());
        env.storage().persistent().set(&key, &report_hash);
        env.events().publish((symbol_short!("report"), target_wallet), report_hash);

        // Inter-contract call to the Reward token contract
        let args: soroban_sdk::Vec<Val> = vec![&env, reporter.into_val(&env)];
        let _res: Val = env.invoke_contract(&reward_contract_id, &Symbol::new(&env, "reward"), args);
    }
}

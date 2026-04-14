#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, symbol_short};

#[contracttype]
pub enum DataKey {
    Balance(Address),
}

#[contract]
pub struct ClarixReward;

#[contractimpl]
impl ClarixReward {
    pub fn reward(env: Env, to: Address) {
        // Mint 10 CLRX tokens to the reporter
        let key = DataKey::Balance(to.clone());
        let mut balance: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        balance += 10_0000000; // 10 tokens with 7 decimals
        env.storage().persistent().set(&key, &balance);
        
        // Publish an event
        env.events().publish((symbol_short!("reward"), to), balance);
    }

    pub fn balance(env: Env, owner: Address) -> i128 {
        env.storage().persistent().get(&DataKey::Balance(owner)).unwrap_or(0)
    }
}

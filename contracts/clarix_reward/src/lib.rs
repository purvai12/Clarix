#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, symbol_short};

#[contracttype]
pub enum DataKey {
    Balance(Address),
    TotalIssued,
    HasBadge(Address),
}

#[contract]
pub struct ClarixReward;

#[contractimpl]
impl ClarixReward {
    pub fn reward(env: Env, to: Address) {
        // Mint 10 CLRX tokens to the reporter
        let key = DataKey::Balance(to.clone());
        let mut balance: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        
        // Calculate bonus based on participation (Complexity: Bonus logic)
        let total_issued: i128 = env.storage().instance().get(&DataKey::TotalIssued).unwrap_or(0);
        let bonus = if total_issued < 1000_0000000 { 2_0000000 } else { 0 }; // Early adopter bonus
        
        balance += 10_0000000 + bonus;
        env.storage().persistent().set(&key, &balance);
        
        // Update total issued
        env.storage().instance().set(&DataKey::TotalIssued, &(total_issued + 10_0000000 + bonus));
        
        // Publish an event
        env.events().publish((symbol_short!("reward"), to), balance);
    }

    pub fn purchase_badge(env: Env, owner: Address) {
        owner.require_auth();
        let key = DataKey::Balance(owner.clone());
        let mut balance: i128 = env.storage().persistent().get(&key).expect("Insufficient balance");
        
        let badge_cost = 50_0000000;
        if balance < badge_cost {
            panic!("Insufficient CLRX for verification badge");
        }
        
        balance -= badge_cost;
        env.storage().persistent().set(&key, &balance);
        env.storage().persistent().set(&DataKey::HasBadge(owner.clone()), &true);
        
        env.events().publish((symbol_short!("badge"), owner), true);
    }

    pub fn balance(env: Env, owner: Address) -> i128 {
        env.storage().persistent().get(&DataKey::Balance(owner)).unwrap_or(0)
    }

    pub fn has_badge(env: Env, owner: Address) -> bool {
        env.storage().persistent().get(&DataKey::HasBadge(owner)).unwrap_or(false)
    }

    pub fn get_total_clrx_issued(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalIssued).unwrap_or(0)
    }
}

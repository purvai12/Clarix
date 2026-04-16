#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype,
    token, Address, Env, Symbol, symbol_short,
};

/// Storage keys
#[contracttype]
pub enum DataKey {
    /// Records that `user` has paid for `feature` at a specific ledger
    FeePaid(Address, Symbol),
    /// Admin / treasury address (set once at init)
    Admin,
    /// Fee amount in stroops (0.5 XLM = 5_000_000)
    FeeAmount,
    /// Reward amount in stroops (10 XLM = 100_000_000)
    RewardAmount,
}

/// ClarixGateway — on-chain fee gating and reporter reward
///
/// Fee collection  : collect_fee(user, feature, xlm_token)
///   → transfers 0.5 XLM from `user` → admin (requires user auth)
///   → records FeePaid(user, feature) so the frontend can verify
///
/// Reporter reward : reward_reporter(reporter, xlm_token)
///   → transfers 10 XLM from admin → reporter (requires admin auth)
///   → emits an event
///
/// Both functions use the Stellar Asset Contract (SAC) wrapper for native XLM.
#[contract]
pub struct ClarixGateway;

#[contractimpl]
impl ClarixGateway {
    /// Initialise: set admin address and fee/reward amounts.
    /// Must be called once after deployment.
    pub fn init(env: Env, admin: Address, fee_stroops: i128, reward_stroops: i128) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::FeeAmount, &fee_stroops);
        env.storage().instance().set(&DataKey::RewardAmount, &reward_stroops);
    }

    /// Charge 0.5 XLM feature fee from `user` → admin.
    /// `xlm_token` = the native XLM wrapped SAC address.
    /// `feature`   = short symbol identifying the feature (e.g. "scanner").
    pub fn collect_fee(env: Env, user: Address, feature: Symbol, xlm_token: Address) {
        user.require_auth();

        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        let fee: i128 = env.storage().instance().get(&DataKey::FeeAmount).unwrap();

        // Transfer native XLM from user to admin via the SAC token interface
        let token_client = token::Client::new(&env, &xlm_token);
        token_client.transfer(&user, &admin, &fee);

        // Record payment
        let key = DataKey::FeePaid(user.clone(), feature.clone());
        env.storage().temporary().set(&key, &true);

        // Emit event
        env.events().publish((symbol_short!("fee"), feature), user);
    }

    /// Send 10 XLM reward to `reporter` — called by admin after verifying report.
    pub fn reward_reporter(env: Env, reporter: Address, xlm_token: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let reward: i128 = env.storage().instance().get(&DataKey::RewardAmount).unwrap();

        let token_client = token::Client::new(&env, &xlm_token);
        token_client.transfer(&admin, &reporter, &reward);

        // Emit event
        env.events().publish((symbol_short!("reward"),), reporter);
    }

    /// Check if a user's fee is recorded (temporary storage, ~1 ledger TTL).
    pub fn has_paid(env: Env, user: Address, feature: Symbol) -> bool {
        let key = DataKey::FeePaid(user, feature);
        env.storage().temporary().has(&key)
    }

    /// Read the current fee amount in stroops.
    pub fn fee_amount(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::FeeAmount).unwrap_or(5_000_000)
    }

    /// Read the current reward amount in stroops.
    pub fn reward_amount(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::RewardAmount).unwrap_or(100_000_000)
    }
}

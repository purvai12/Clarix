#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, vec, Address, Env, String, Symbol, Val, IntoVal, symbol_short, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReportRecord {
    pub reporter: Address,
    pub report_hash: String,
    pub timestamp: u64,
    pub status: u32, // 0: Pending, 1: Verified, 2: Rejected
}

#[contracttype]
pub enum DataKey {
    Report(Address, String), // Specific report: reporter -> target_wallet
    WalletReports(String),    // List of report hashes for a target_wallet
    TotalReports,             // Global counter
    Admin,                    // Admin address
}

#[contract]
pub struct ClarixRegistry;

#[contractimpl]
impl ClarixRegistry {
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    pub fn file_report(env: Env, reporter: Address, target_wallet: String, report_hash: String, reward_contract_id: Address) {
        reporter.require_auth();
        
        let report = ReportRecord {
            reporter: reporter.clone(),
            report_hash: report_hash.clone(),
            timestamp: env.ledger().timestamp(),
            status: 0,
        };

        // Store specific report
        let key = DataKey::Report(reporter.clone(), target_wallet.clone());
        env.storage().persistent().set(&key, &report);

        // Update wallet report list
        let list_key = DataKey::WalletReports(target_wallet.clone());
        let mut reports: Vec<String> = env.storage().persistent().get(&list_key).unwrap_or(vec![&env]);
        reports.push_back(report_hash.clone());
        env.storage().persistent().set(&list_key, &reports);

        // Increment global counter
        let total: u32 = env.storage().instance().get(&DataKey::TotalReports).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalReports, &(total + 1));

        env.events().publish((symbol_short!("report"), target_wallet), report_hash);

        // Inter-contract call for reward
        let args: Vec<Val> = vec![&env, reporter.into_val(&env)];
        let _res: Val = env.invoke_contract(&reward_contract_id, &Symbol::new(&env, "reward"), args);
    }

    pub fn get_report(env: Env, reporter: Address, target_wallet: String) -> Option<ReportRecord> {
        env.storage().persistent().get(&DataKey::Report(reporter, target_wallet))
    }

    pub fn get_wallet_report_count(env: Env, target_wallet: String) -> u32 {
        let reports: Vec<String> = env.storage().persistent().get(&DataKey::WalletReports(target_wallet)).unwrap_or(vec![&env]);
        reports.len()
    }

    pub fn get_total_reports(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::TotalReports).unwrap_or(0)
    }

    pub fn update_report_status(env: Env, admin: Address, reporter: Address, target_wallet: String, new_status: u32) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).expect("Not initialized");
        if admin != stored_admin {
            panic!("Unauthorized");
        }

        let key = DataKey::Report(reporter, target_wallet);
        if let Some(mut report) = env.storage().persistent().get::<DataKey, ReportRecord>(&key) {
            report.status = new_status;
            env.storage().persistent().set(&key, &report);
        }
    }
}

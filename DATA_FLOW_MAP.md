# DATA FLOW MAP

Canonical core/data boundaries: [docs/rebuild/01-core-contract.md](docs/rebuild/01-core-contract.md).  
Orchestration contracts: [docs/rebuild/03-orchestration.md](docs/rebuild/03-orchestration.md).

The Fusion Shell is presentation/orchestration only. It does not introduce a competing database, rename production storage keys, mutate the encrypted payload, or bypass `SKosifCore` / `SKServices`. Future schema changes require an explicit reversible migration.

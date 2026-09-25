# DEPENDENCY MAP

Canonical core contracts: [docs/rebuild/01-core-contract.md](docs/rebuild/01-core-contract.md).  
Canonical orchestration map: [docs/rebuild/03-orchestration.md](docs/rebuild/03-orchestration.md).

Required direction is Data → Domain/Core → Application Service → Capability → Product Workspace → Interface. UI code must not become the source of truth for pricing, ZATCA, storage, inventory, meat operations, permissions, or audit state.

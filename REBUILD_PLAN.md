# REBUILD PLAN

## Phase A — Discovery and contracts
Status: started.

- capability inventory.
- dependency/data maps.
- data migration contract.
- golden business rules.

## Phase B — New foundation
- new production React shell.
- design tokens/components.
- repository/service layer.
- event bus.
- capability registry.
- command palette and unified search.
- centralized error boundary/toasts.

## Phase C — Daily capabilities
1. catalog/pricing.
2. sales/customers/orders.
3. inventory/counts/procurement.
4. finance/income statement.
5. approvals.

## Phase D — Intelligence and audit
- Jev center.
- analytics/risk.
- audit workspace adapters.
- capabilities/RBAC.

## Phase E — Migration and cutover
- bootstrap from existing encrypted data.
- additive canonical store migration.
- coverage matrix.
- production build switch.
- Cloudflare preview + production deployment.

## Phase F — Legacy purge
Executed only after:
- core capability coverage = 100%.
- golden tests pass.
- production smoke tests pass.
- rollback point verified.

Then delete legacy presentation source, versioned UI layers and obsolete payload code. Git history remains the only backup.

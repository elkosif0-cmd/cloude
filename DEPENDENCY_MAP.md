# DEPENDENCY MAP

## Target dependency direction

```
Encrypted seed/private catalog
        ↓
LegacyBootstrapAdapter (data only)
        ↓
Repositories / IndexedDB / Local fallback / D1 sync
        ↓
Domain engines + application services
        ↓
Capability contracts + event bus
        ↓
Feature controllers/hooks
        ↓
Design-system components
        ↓
New shell / routes / command palette
```

UI may not import legacy presentation modules.

## Important current chains

| Data | Logic/Service | Capability | Output |
|---|---|---|---|
| Raw item purchase price + VAT + waste | corePricing.calculateRawPricing | Raw material costing | usable cost, break-even, margin, target price |
| Box recipe + raw/box components | corePricing.calculateBoxPricing | Box costing | total cost, margin, target price |
| Carcass + cut yields | meatOps.allocateCarcassCost / NRV | Carcass economics | cost per cut, margin, NRV |
| Orders + payments | commerce/finance service | Orders & collections | paid, due, gateway cost |
| Customers + sales lines | customer analytics | Customer intelligence | value, recency, geography, churn |
| Inventory qty + velocity + lead time | inventory policy | Reorder planning | coverage, reorder point, suggested qty |
| Inventory movement + counts | inventory ledger | Stock control | on-hand, count variance, audit trail |
| Supplier batches + waste | procurement analytics | Supplier review | effective unit cost, variance, supplier score |
| Finance flows + income statement | finance service | Financial center | cash flow, P&L, drill-down |
| Pricing/stock/finance summaries | Jev context builder | Decision intelligence | recommendation/simulation; human approval required |
| Workspace state | Capabilities v2 Worker/D1 | central sync/RBAC | revisioned state + integrity |
| Audit source data | audit bridge/adapters | Audit workspace | tests, issues, evidence, reports |

## Event architecture

- `catalog.item.created`
- `catalog.item.updated`
- `price.updated`
- `order.created`
- `order.updated`
- `payment.received`
- `inventory.movement.recorded`
- `inventory.count.approved`
- `supplier.batch.received`
- `expense.recorded`
- `income_statement.saved`
- `approval.requested`
- `approval.completed`
- `jev.recommendation.created`
- `workspace.synced`

Events are application-level messages; persistence side effects live in services/repositories, not visual components.

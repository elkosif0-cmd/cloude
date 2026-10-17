# NEW INFORMATION ARCHITECTURE

## Navigation levels

1. **Primary (always visible, daily work)** — five groups, driven by `capabilities.json` (`primary: true`):
   اليوم · البيع والعملاء · الأصناف والأسعار · المخزون والتجهيز · المال والتقارير
2. **Secondary (progressive disclosure)** — «الأدوات المتقدمة» switch in the rail reveals:
   التحليل · هندسة التسعير · الذبيحة والجزارة · المطابقة · المحاسبة والمراجعة · النظام
   Opening any advanced screen directly (palette, link) turns the switch on automatically.
3. **Contextual** — actions inside a screen (topbar actions of the core, item card, Product 360, "اسأل Jev").
4. **Global** — Ctrl+K / ⌘K / `/` command palette: screens, actions, items, recent, pinned, calculator (`=`), customer/order search.

Settings stays reachable from the rail footer on every role.

## Home = Command Center

Order of blocks (top → bottom), each from real records only:
1. Greeting + date + one-line status.
2. **ما يحتاج قراراً الآن** — exception inbox (losses, below target, pending approvals, collection exceptions, at-risk customers, runtime errors) → each row opens the screen that fixes it.
3. **مؤشرات اليوم** — box margin average, items at loss, pending memos, cold-chain last reading, open credit — only when recorded.
4. **ابدأ عملاً** — the six most used daily actions (new sale/POS, price list, offers, customers, inventory, cash).
5. The existing dashboard body (charts, margin table) below, unchanged.

## Screen template

Page header (title, subtitle, breadcrumb group › screen) → contextual actions → content cards. Every screen supports the states in `ui/components/states.js`: loading, empty, error, offline, no-permission, partial, success.

## Naming

One name per capability, taken from `capabilities.json` (`label`). Nav, palette, page title and docs use it; the old names are kept only in the `legacy` column for the old→new matrix.

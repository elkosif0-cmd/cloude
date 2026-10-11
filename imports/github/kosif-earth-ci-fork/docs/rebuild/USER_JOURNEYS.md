# USER JOURNEYS

Each journey lists the path in the new shell and the capability ids it touches.

| # | Journey | Role | Path | Capabilities |
|---|---|---|---|---|
| J1 | Start the day | owner | open app → Command Center → "ما يحتاج قراراً" → open first exception | dash, decision |
| J2 | Sell at the counter | sales | Ctrl+K "فاتورة" → POS → add items / scan label → split payment → print QR invoice | zatca, scanner, labels |
| J3 | Send a price offer | sales | البيع › العروض → pick items → cart → WhatsApp / print | offers, catalog |
| J4 | Change a price safely | owner | الأصناف › التسعير السريع → target margin → add to memo → اعتماد الأسعار → approve → archive logs it | sim, memo, archive, catalog |
| J5 | Receive a supplier batch | warehouse | المخزون › الموردون → new batch (weight, price, VAT) → inventory updated → cost feeds reports | suppliers, inventory, execreports |
| J6 | Track cold chain | warehouse | المخزون › التتبع والتبريد → add reading → Command Center shows last reading | traceability, dash |
| J7 | Collect receivables | accountant | المال › الذمم → aging → WhatsApp reminder; restaurants on credit → ائتمان المطاعم → record payment | receivables, b2bcredit |
| J8 | Import sales history | owner | البيع › العملاء → import Excel/CSV → matching → customer 360 | customers, smartmatch |
| J9 | Month-end review | accountant | المال › التقارير التنفيذية (P&L, VAT, waste) → advanced › المحاسبة → trial balance from books → audit report | execreports, auditdocs, auditfin, auditreport |
| J10 | Ask Jev | owner | any screen → "اسأل Jev" / Ctrl+K "Jev" → structured decision on aggregate data | jev, decision |
| J11 | Back up / restore | owner | الإعدادات → نسخة كاملة → restore: choose file → dry-run preview → confirm → automatic pre-restore snapshot → rollback button | settings, X-backup |
| J12 | Restricted user | viewer | rail shows only allowed screens; direct link to a hidden screen shows the no-permission state | X-perm |

Acceptance for every journey: no floating element covers content, works at 390×844 (iPhone) and 1440×900, no console errors.

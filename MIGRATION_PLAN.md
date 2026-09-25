# MIGRATION PLAN

Canonical reconstruction sequence: [docs/rebuild/03-orchestration.md](docs/rebuild/03-orchestration.md).  
Verification evidence: [docs/rebuild/06-testing-report.md](docs/rebuild/06-testing-report.md).  
Final status: [docs/rebuild/07-final-report.md](docs/rebuild/07-final-report.md).

Strategy is Strangler / Controlled Replacement: freeze legacy presentation, protect the core/data contracts, install one shell, migrate capability presentation behind parity gates, validate, then physically purge superseded presentation only when the coverage matrix remains green.

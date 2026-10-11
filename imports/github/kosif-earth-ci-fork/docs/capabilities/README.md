# Capability architecture

This folder is the canonical place for capability inventory and redistribution work.

For every capability, record:
- capability id/name
- current source modules/engines
- current UI placement
- canonical target section: accounting / audit / helper tools / shared platform service
- whether it is general or sector-specialized
- sector variants required
- keep / merge / rebuild / relocate / retire decision
- dependencies and data stores
- test evidence
- migration notes

A capability must not remain in a wrong section merely for backward compatibility.

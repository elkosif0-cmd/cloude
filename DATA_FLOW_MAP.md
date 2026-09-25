# DATA FLOW MAP

## Sources of truth

- **Encrypted bootstrap**: protected initial business dataset and private catalog.
- **IndexedDB**: high-volume local operational data and imported records.
- **LocalStorage**: configuration and compact local-first records during migration.
- **Capabilities v2 D1**: revisioned central workspace state/RBAC/integrity summaries.
- **External workers**: Jev and future authenticated server services.

## Migration read priority

1. Current-domain operational stores already written by the user.
2. Current IndexedDB records.
3. Current localStorage records.
4. Decrypted encrypted bootstrap/private catalog.
5. Static seed defaults only when no user record exists.

Never overwrite a newer user record with a seed/default.

## Data boundaries

- UI receives typed DTOs from repositories/services.
- components never call localStorage/IndexedDB directly.
- AI receives redacted, minimal evidence/context packs.
- D1 generic workspace snapshots exclude raw PII/secrets.
- large/private operational datasets need dedicated typed backend tables before central sync.

## Offline behavior

Reads: local repositories first.
Writes: local transaction + outbox event.
Online: background/explicit sync to authenticated backend when configured.
Conflict: revision-aware merge or user review; never silent overwrite.

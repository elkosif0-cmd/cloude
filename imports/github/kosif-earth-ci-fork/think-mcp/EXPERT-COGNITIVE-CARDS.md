# Expert Cognitive Cards v1

## Purpose

This layer strengthens the existing Council-500 without increasing the counted council beyond 500. It turns each counted expert into a deterministic method role with a distinct cognitive signature rather than relying on a name or persona label alone.

The source material was the user-supplied Expert Council archive reviewed on 2026-10-02. The normalized attachment-derived cognitive source is bound by:

`sha256:fde0c8bcccea08231389591ea379654563dc39bdcd9d2cbb9f7a19016a716166`

Runtime contract: `attachment-cognitive-cards-v1`.

## Source-derived building blocks

The attachment defines 30 operational reasoning powers, 24 cognitive stances with explicit blind spots and mandatory compensations, 50 domains, 10 schools of thought, and a workflow based on independent proposals, red-team challenge, verification, revision and synthesis.

KOSIF reuses these as **method roles**. A cognitive stance is not a diagnosis, personality claim, or assertion about a real person's private mental state.

## Council-500 mapping

For expert index `i = 0..499`:

- primary reasoning power: `i % 30`
- secondary power: `(i*7 + floor(i/30) + 1) % 30`, adjusted if it equals the primary
- cognitive stance: `(i*11 + floor(i/24)) % 24`
- school: `(i*3 + floor(i/10)) % 10`

This deterministic mapping is required to produce:
- 500 counted experts;
- 500 unique combined cognitive signatures;
- coverage of all 30 powers as primary and secondary methods;
- coverage of all 24 stances;
- coverage of all 10 schools.

## Runtime behavior

For requests started under Cognitive Cards v1, each expert receives:
- the existing domain/scientist method persona;
- two operational reasoning methods;
- one cognitive stance;
- its known blind spot;
- mandatory compensation for that blind spot;
- one school of thought;
- a deterministic trait vector and signature question.

Each expert must still work independently before peer exposure and return three substantively distinct proposals.

Each proposal carries:
- `epistemic_status`: `confirmed`, `probable`, or `hypothesis`;
- a falsifier or observable decision-changing test.

The expert output also contains a short `cognitive_check.compensation_applied`. The runtime retries/fails the expert output if the mandatory compensation is absent.

## Diversity Receipt

The Council audit for new requests validates the expert signature against the deterministic seat assignment and emits `cognitive_diversity` with:
- unique signature count;
- primary and secondary power coverage;
- stance and school coverage;
- exact normalized unique-proposal ratio;
- epistemic-status counts;
- whether blind-spot compensation was required.

Hard requirements are 500 unique signatures, 30/30 power coverage, 24 stance coverage and 10 school coverage. The proposal uniqueness ratio is measured and exposed; it is not promoted to a hard semantic-diversity claim without a separate semantic test.

## Epistemic discipline

The attachment constitution explicitly discourages invented figures, studies, sources and quotations. KOSIF therefore treats `confirmed / probable / hypothesis` as an output contract and requires a falsifier/test. Source Taint still applies: repetition, clustering, Jev selection or Einstein synthesis cannot convert unverified provenance into verified evidence.

## Backward compatibility

Old in-flight Full Pro requests that do not carry `cognitive_cards_version` remain auditable under their original contract. New requests created by runtime 0.18.x opt into Cognitive Cards v1 and must satisfy its audit.

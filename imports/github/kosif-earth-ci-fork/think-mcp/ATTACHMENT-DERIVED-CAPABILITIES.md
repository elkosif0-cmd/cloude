# Attachment-Derived Capability Map

Last reviewed: 2026-10-01

This document records principles distilled from user-supplied KOSIF / Einstein / Cinema reference materials. It is a provenance map, not a claim that every source file or historical implementation was copied into the runtime.

## Principles adopted into the current runtime

### Einstein reasoning protocol
Current contract: `einstein-attachments-v2`

Adopted principles:
- empirical observation before interpretation;
- first-principles decomposition;
- Gedankenexperiment / mental simulation before execution;
- observer/frame-of-reference checks;
- unification of interacting constraints rather than local optimization;
- radical simplicity / remove non-essential assumptions;
- empirical-verification revision planning with observable postconditions.

Implementation location:
- `think-mcp/worker.js`
- Council-500 finalizer / Einstein stage receipts.

### Visual intelligence and prompt grammar
Current contract: `attachment-cinema-v1`

Adopted principles:
- explicit subject → action → environment → composition → camera → lighting → materials → atmosphere → mood → constraints;
- camera/lens choices must be physically and compositionally coherent;
- lighting, shadows, reflections and material response must share one causal model;
- anatomy / geometry / center-of-mass / support must be plausible for the depicted subject;
- continuity anchors matter when identity or multi-frame consistency is requested;
- plot-hole / contradiction checking is useful before execution;
- do not inject stylistic or atmospheric motifs merely because a historical source recommended them.

Implementation location:
- generic SceneSpec construction and deterministic fallback in `think-mcp/worker.js`;
- task-aware post-generation verification in `think-mcp/secure-executor/worker.js`.

### Task-aware visual QA
Current contracts:
- `vision_task_aware_v5`
- `active-values-v3`

Adopted principles:
- only judge concepts that are positively active in the frozen SceneSpec;
- negated concepts such as "no rain" or "do not add fire" must not activate rain/fire quality checks;
- specialized checks for birds, dragons, fire, rain, scale contrast or no-human-hands are conditional, not global;
- post-generation visual QA is evidence, not hidden reasoning.

### Continuity and sequence logic
Source-derived principles retained for future sequence/video work:
- character/reference consistency anchors;
- temporal keyframes;
- identical or intentionally evolving lighting/style anchors;
- one clear causal action per beat;
- stable identity across views.

Current status:
- principles are documented and partially reflected in generic visual planning;
- no claim is made that a full multi-frame/video executor exists in the current Secure Executor.

### Action physics / VFX
Adopted principles:
- use center of mass, support, force/contact plausibility and material interaction;
- treat weather, particles, fire, liquids and debris as physical participants only when actually requested;
- avoid impossible subject displacement or contradictory cause/effect;
- separate environmental effects from character-caused effects unless the request explicitly couples them.

### Evidence / governance
Current contracts:
- `attachments-governance-v1`
- `source-taint-v1`
- `execution-binding-v1`
- Capability Truth registry.

Adopted principles:
- source repetition does not cleanse weak provenance;
- consensus and Jev selection do not upgrade unverified evidence;
- preserve dissent and contradiction receipts;
- freeze the executable decision before side effects;
- verify postconditions independently after execution.

## Deliberately not copied from historical attachments

The current runtime does not automatically adopt:
- historical provider names or availability claims;
- stale platform limits or model-specific marketing claims;
- hard-coded aesthetic recipes as universal defaults;
- hidden API credentials, dashboard secrets or raw remote-control bindings;
- fixed task fixtures such as duck/dragon anatomy in unrelated visual tasks;
- claims that a registered host plugin is currently connected.

Provider/tool availability is runtime- and host-verified only.

## Current source-of-truth

See `think-mcp/RUNTIME-MANIFEST.md` for the live version, Cloudflare/GitHub synchronization rules and plugin release mapping.

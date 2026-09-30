# KOSIF Reasoning Protocol v1

This document defines the first book-derived reasoning layer for KOSIF Think. The goal is not to paste books into prompts. The goal is to compile durable principles into explicit policies, routing gates, tests, and measurable behavior.

## Runtime protocol

Every substantive KOSIF reasoning pass should use this sequence:

1. Clarify the problem, constraints, and observable success criteria.
2. Separate observations, assumptions, unknowns, and claims requiring evidence.
3. Generate multiple alternatives and multiple representations of the problem.
4. Run a bias audit for overconfidence, confirmation bias, availability, anchoring, and framing.
5. State uncertainty and identify evidence that could change the decision.
6. Define objective, constraints, downside risk, reversibility, cost, and permissions.
7. Prefer the smallest reversible tracer action that can reduce uncertainty before a large commitment.
8. Keep execution components orthogonal and testable; avoid hidden coupling.
9. Verify observable postconditions and actively seek disconfirming evidence.
10. Reflect on the outcome and update routing/reliability history.

## Tool-choice protocol

KOSIF does not treat a model's self-reported confidence as probability of correctness.

For a host tool to become a Jev candidate it must be present in the live host inventory. KOSIF computes a deterministic support vector from:

- task/capability fit
- trust
- schema compatibility
- freshness
- observed reliability history
- evidence quality
- reversibility/idempotence
- safety
- cost/permission compatibility
- latency
- dependency diversity after a failure

When material ambiguity remains, KOSIF sends only the closed candidate set to Jev Choice and adds an explicit ABSTAIN option. Jev is a bounded chooser/veto/abstainer, not a source of authorization.

Consequential execution requires all of the following:

- chosen ID belongs to the fresh closed candidate set
- candidate-set digest matches
- at least three independent support signals
- deterministic support >= 0.82
- Jev probability for the chosen tool >= 0.92
- Jev decision confidence >= 0.85
- conservative composite execution confidence >= 0.90
- cost/permission and human-risk gates pass
- postcondition verification is available

These are operational gates, not an empirical guarantee that the choice is correct.

## Failure and substitution

A failed, stale, low-trust, or schema-drifted route is quarantined for the task. KOSIF refreshes the live inventory and reruns routing. When multiple replacements remain, a fresh Jev choice is required. Fallbacks should prefer a different dependency group so that a shared provider failure does not masquerade as redundancy.

Writes remain idempotency-aware and single-writer. Credentials, MFA/OTP, payment confirmation, CAPTCHA/anti-bot checks, and other security-sensitive checkpoints stay human-gated.

## Provider robustness

Frontier-agent calls tolerate a single transient empty/network/429/5xx Clean APIs failure and retry once. Permanent/non-retryable upstream failures remain visible only as KOSIF public error codes. Council execution continues to tolerate partial-agent failure and falls back conservatively rather than inventing missing artifacts.

## Source-to-module compilation

### Implemented in v1

**Judgment and decision-making**
- bias audit
- explicit assumptions and uncertainty
- anti-overconfidence and alternative generation

**Smart Thinking**
- problem interpretation before action
- multiple representations and alternatives
- rational comparison under uncertainty and risk
- reflection after decision

**The Pragmatic Programmer**
- reversibility
- small tracer actions with fast feedback
- orthogonality/testability
- observable verification and localized recovery

### Queued for deeper extraction in later passes

The following uploaded works are valuable, but several copies are scan-heavy or alternate editions. They should be converted into testable modules only after page-level extraction rather than being guessed from titles:

- Probability Theory: The Logic of Science -> Bayesian evidence update/calibration module
- Probabilistic Graphical Models -> dependency/conditional-independence reasoning module
- Convex Optimization -> objective/constraint and feasible-set optimization module
- Aristotle's Organon -> formal validity, contradiction, categories, and fallacy checks
- Code Complete -> construction quality, defensive programming, and review module
- SICP material -> abstraction, decomposition, evaluators, and compositional reasoning
- The Conflict Thesaurus -> adversarial scenario/obstacle-generation module

## Required benchmark families

1. Tool-selection closed-set test: invented tools must never be selected.
2. Abstention test: weak evidence must produce ABSTAIN or evidence collection.
3. Bias test: an attractive but poorly evidenced option must not win from framing alone.
4. Schema-drift test: a changed schema invalidates the previous choice.
5. Failure-substitution test: a failed provider is quarantined and fallback prefers dependency diversity.
6. Side-effect test: transport success without observable postcondition is not completion.
7. Provider-degradation test: one empty frontier response retries once; persistent failures do not fabricate an answer.
8. Reversibility test: low-risk reversible probes precede irreversible actions when they can reduce uncertainty.
9. Disconfirmation test: KOSIF must record evidence against its current preferred option.
10. Learning test: routing reliability history may update future priors but may not bypass live safety/schema checks.

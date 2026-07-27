# WORKFLOW.md — Vague vs. Precise Prompting Comparison

## Setup
Feature: a user profile settings form (Full Name, Email, Website, Bio) with validation.
Branch A: `feature/settings-form-vague` — one-sentence prompt, no follow-up.
Branch B: `feature/settings-form-precise` — detailed prompt with file references, constraints, edge cases, and a required test-and-verify loop.

## Correctness
Both rounds got basic required-field and email validation right. But Round 1 had a real correctness gap: **it never enforced a maximum length on Full Name**. A user could submit a 5,000-character string as their name and it would be accepted. Round 2's prompt explicitly stated "min 2, max 50 characters," and the resulting code enforced both bounds.

Website validation also differed in quality, not just presence. Round 1 used a loose regex (`/^https?:\/\/.+\..+/`) that can pass malformed strings or reject valid edge cases. Round 2 used the browser's actual `URL()` parser and checked `.protocol`, which is far more reliable — this wasn't something I asked for explicitly, but came from giving the agent room to reason about "valid URL" properly instead of pattern-matching under-specified.

## Accessibility
Both rounds correctly paired `<label htmlFor>` with matching input `id`s — no gap there. The real difference was **error-to-field association**. Round 1 rendered error text visually below each input but never connected it via `aria-describedby`, and never set `aria-invalid`. A screen reader user tabbing through the form gets no signal that a field failed, or why. Round 2 wired every field with both attributes, because I stated it as an explicit constraint rather than assuming "accessible" would be inferred.

## Edge Cases
Round 1 handled whitespace-only names correctly by accident (its `.trim().length < 2` check happens to catch it), but had zero test coverage to confirm this — I only know because I read the code. Round 2 explicitly listed six edge cases up front and wrote a test for each.

## AI Mistake I Caught
Round 2's own plan stated Full Name should be capped at 50 characters, and the validation code did enforce it correctly — but the first batch of 6 written tests never actually tested that boundary. The agent reported "all tests passed" and treated the task as done. Only after I explicitly asked "does it actually enforce this?" did it add the missing test. This taught me that a passing test suite doesn't mean the tests match the stated spec — I have to cross-check the plan's requirements against the actual test list myself.

## Review Effort
Round 1 felt fast (~2 minutes to generate) but needed a full manual code read afterward to catch the missing max-length check and the missing `aria-describedby` — bugs I only found by inspection, since there were no tests to catch them. Round 2 took noticeably longer up front (multi-step plan, install test deps, run and re-run tests) but needed almost no manual fixing from me — my only intervention was asking it to verify one already-stated constraint. Counting total time including review and fixing, Round 2 was faster end-to-end, even though it felt slower while it was running.
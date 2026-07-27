# CLAUDE.md — Project Rules

## Form Validation
- Every form field with a length constraint (min/max characters) must have BOTH bounds enforced in code AND a corresponding test for each bound. A stated constraint with no test is treated as unverified, not done.
- URL/email/format validation must use proper parsing (e.g. `new URL()` for URLs) instead of hand-written regex, unless a regex is explicitly reviewed and justified.
- Whitespace-only input must be explicitly trimmed and rejected for any "required" text field — never rely on an accidental side-effect of another check.

## Accessibility
- Every form input must have a `<label htmlFor>` matched to a unique `id` — no placeholder-only or ambiguous labeling.
- Every field-level error message must be wired to its input via `aria-describedby`, and the input must set `aria-invalid` when that field has an error. Visual-only error text (no ARIA wiring) fails review.

## Verification Loop
- After implementing any feature, write tests covering every edge case explicitly stated in the prompt, and confirm each one appears in the final test list by name — a "tests passed" message is not sufficient proof; the test names must match the stated requirements.
- Do not add unrequested visual/design features (animations, decorative elements) before core validation and accessibility requirements are confirmed complete and tested.
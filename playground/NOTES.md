# NOTES.md — Comparing Hand-Built Components vs shadcn/ui

I built `Modal.tsx`, `Tabs.tsx`, and `Disclosure.tsx` from scratch against the W3C ARIA Authoring Practices, then installed shadcn/ui's `dialog` and `tabs` and read the generated source (built on Base UI primitives) to compare. All three of my components passed manual keyboard testing (Tab/Shift+Tab trap and cycle correctly in the modal, arrow keys move focus+selection in tabs with disabled-tab skipping and Home/End support, Enter/Space toggle the disclosure with hidden content unreachable by Tab). The gaps below are things shadcn handles that mine either missed entirely or handled more fragilely.

## Modal / Dialog

**1. No portal rendering — real structural risk I didn't consider.**
shadcn's `DialogContent` wraps everything in a `DialogPortal`, which renders the dialog at the end of `<body>` regardless of where the component is declared in the tree. My `Modal.tsx` renders inline, in the normal DOM position of wherever it's mounted. This matters in practice: if my modal ever gets nested inside a parent with `overflow: hidden`, a lower `z-index` stacking context, or a CSS `transform` (which creates a new containing block), the modal could get visually clipped or mispositioned even though the accessibility tree and keyboard behavior are still correct. My manual testing never caught this because my playground page has no such parent containers — it's a gap that only shows up once the component is dropped into a real layout.

**2. No description pattern — I only handle the title, not supplementary context.**
shadcn exposes a `DialogDescription` component (`aria-describedby`-linked) alongside `DialogTitle`. My modal only wires up `aria-labelledby` to the title; there's no equivalent slot or pattern for a secondary description that screen reader users would also want announced (e.g. "This action cannot be undone"). I implemented the *label* half of the pattern correctly but missed that ARIA dialogs typically want both a name and a description hooked up.

**3. Focus timing relies on a hardcoded delay instead of reliable scheduling.**
My focus-on-open logic uses `setTimeout(focusModal, 30)` — an arbitrary 30ms guess to let the DOM settle before querying for focusable elements. This is a magic number that could be too short on a slow device or unnecessarily delay focus on a fast one. shadcn/Base UI's primitive handles this internally without an arbitrary timeout, presumably using more reliable render-completion signals than a guessed delay. Mine works in my testing environment, but it's the kind of timing hack that's genuinely fragile across different devices and React render timing.

## Tabs

**4. No `:focus-visible` distinction — keyboard and mouse users see the same focus state.**
shadcn's `TabsTrigger` uses `focus-visible:ring-[3px] focus-visible:ring-ring/50`, meaning the visible focus ring only appears when the tab is reached via keyboard, not via mouse click. My `Tabs.tsx` relies on the browser's default `outline` behavior, which doesn't make this distinction — a sighted mouse user clicking a tab and a sighted keyboard user tabbing to it get visually identical states. This isn't a hard ARIA requirement, but it's a real, well-established usability pattern for keyboard users that I didn't think to implement myself.

**5. Declarative state styling vs. computed inline styles.**
shadcn drives all visual state (`data-active`, `data-orientation`, `data-variant`) through data attributes styled via Tailwind selectors. My version computes `isSelected` in JavaScript on every render and switches an inline `style={{}}` object per tab. Functionally equivalent for the user, but structurally different: my approach recomputes and re-assigns style objects on every render, while shadcn's approach lets the browser's CSS engine handle state-based styling without touching JS render output at all. Not an accessibility gap, but a real difference in how "state" is represented in the two versions.

## Disclosure

No shadcn disclosure component was installed for direct comparison (shadcn doesn't ship a standalone Disclosure primitive; the closest equivalent, Accordion, is a different pattern — a single expand/collapse button matches the ARIA Disclosure pattern more directly than Accordion's group-of-items semantics). My hand-built version passed every manual keyboard test performed.

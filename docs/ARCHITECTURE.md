# Architecture

Status: proposed, not approved. No gameplay, scaffolding, dependencies, or feasibility prototype is authorized by this document.

## Decision and alternatives

Recommend a static HTTPS browser application with a deterministic simulation core and semantic DOM presentation. TypeScript is proposed for domain contracts. No framework is selected or installed.

| Alternative | Benefits | Costs and decision |
|---|---|---|
| Pure simulation plus native DOM | Small runtime surface; direct input/focus control; static deployment; reproducible tests | Requires explicit fidelity modeling and careful rendering. Proposed starting point. |
| Same core plus React presentation | Declarative components if presentation complexity earns them | Adds dependencies and potential competing component state. Viable alternative, not required. React rendering must remain pure [B12]. |
| Browser terminal connected to live Herdr | Uses upstream behavior rather than reproducing it | Requires backend PTY isolation, authentication, process cleanup, resource limits, and nondeterministic coordination. Browser interception still applies. Reject for initial scope. |

A terminal emulator interprets terminal sequences. It does not implement Herdr workspaces, modes, focus, agent detection, or lifecycle. A canvas, WASM terminal, or desktop wrapper does not automatically solve fidelity or host-key interception.

The game models a declared, pinned Herdr subset around fictional applications. It is neither a general shell nor a replacement for Herdr. Adopt no Yazi component structure solely because the reference uses it; consult `YAZI_QUEST_ANALYSIS.md`.

## State ownership

| Boundary | Owns | Excludes |
|---|---|---|
| Herdr simulation | Hierarchy, split tree, modes, bindings, logical focus, attachment, agent detection/status behavior | Plot, hints, grading, DOM focus |
| Fictional applications | Allowlisted commands, fictional records, process output and activity | Real shell, host filesystem, invented Herdr actions |
| Narrative | Facts, discoveries, character knowledge, causal consequences, one-shot/re-entry triggers | Navigation rules and keyboard-credit fabrication |
| Learning | Objectives, accepted action/state evidence, attempts, assistance and modality | Story completion as proof of skill |
| Presentation/accessibility | Authentic visual projection, transcript, external controls, announcements | Authoritative domain state |
| Host/persistence adapters | Browser input, permissions, visibility, storage, clipboard results | Unrecorded domain decisions |

Logical pane focus and DOM focus are distinct. Reading the transcript must not silently move the simulated pane focus.

### Transition protocol

One ordered transition loop accepts normalized input/host events, applies an authentic Herdr or fictional-application transition, and emits committed facts. Narrative and assessment observe those facts in a defined order. Narrative requests enter the same queue with explicit causal provenance. Rendering follows committed state.

Host effects run outside the core and return correlated result events. Core functions cannot read the DOM, storage, clipboard, network, wall clock, or ambient randomness. Reject trigger cycles rather than running an unbounded settlement loop.

Do not create an event-bus framework, generic workflow engine, or plugin platform for this design.

## Fidelity boundary

Use the baseline and contracts in `HERDR_RESEARCH.md` and `HERDR_FIDELITY.md`. Do not infer behavior from function names or unreviewed drafts.

- Model client attachment, pane representation, terminal identity, and process state separately.
- Closing a pane and detaching a client are different operations.
- Browser pause/reload is not Herdr detach/reattach.
- A detach lesson needs an appropriate fictional outer-shell context and authentic reattachment, not a page reconnect button credited as keyboard evidence.
- Game-only controls stay outside Herdr chrome. Story-specific commands belong to fictional pane applications.
- Fictional configuration exercises never read or mutate the user's actual Herdr config.

Unknown source branches block the relevant lesson. They are not opportunities to invent convenient behavior.

## Browser input feasibility

Herdr's default is `Ctrl+B`, release, then an action key [H1]. `prefix+w` is therefore different from simultaneous `Ctrl+W`. Chrome assigns tab close to `Ctrl+W` on Windows/Linux and `Command+W` on macOS [B1]. Firefox source assigns its bookmarks-sidebar shortcut to accelerator+B [B2].

Those assignments establish a conflict to investigate, not whether a particular page can cancel it. No browser/OS/layout/assistive-technology combination is verified yet.

Input must survive the operating system, assistive technology and enclosing host, then browser handling, before page code can interpret delivered events. An enclosing multiplexer may consume its prefix first. The game cannot recover an event it never receives.

`preventDefault()` only cancels delivered, cancelable events and does not work from a passive listener [B3]. Keyboard Lock is limited/experimental, requires a secure context and activation, and captures only keys permitted by the OS [B4]. Chrome documents JavaScript-initiated fullscreen and permission requirements [B5]. The specification describes best-effort behavior and distinguishes JavaScript fullscreen from F11 fullscreen [B6].

Test ordinary top-level HTTPS delivery first. Fullscreen/Keyboard Lock is an optional candidate, not a promised fix. Mobile, embedded frames, remote desktops, installed-app modes, and terminal-embedded browsers are not presumed supported.

### Input adapter

Record relevant observations: `key`, `code`, modifiers, location, repeat, event phase, composition state, capture context, logical target, and monotonically ordered sequence.

`key` reflects interpreted values; `code` reflects physical position [B7]. Do not map all commands through physical US positions or substitute Command for Control globally. Browser physical-key events are not automatically equivalent to Kitty terminal reporting.

Use text-input/composition events for text, including paste, dead keys, AltGr, IME, and grapheme-aware editing. `beforeinput` alone may be absent or non-cancelable [B8]. Do not interpret composing text as shortcuts. Repeat and release rules are context-specific; preserve upstream behavior.

### Capture and prefix are separate state machines

Host states: ordinary page navigation, deliberate capture, suspended capture. Restore saves with capture released. On blur, hidden document, fullscreen exit, permission loss, or explicit release, stop routing gameplay input, clear host-held modifier bookkeeping, pause logical time, and require deliberate resume.

The pending-prefix policy at this host boundary must be explicit. Never apply a stale pending action to unrelated page typing. Do not claim a host safety reset is an upstream key action.

Inside capture, implement only verified Herdr modes. Tests must cover prefix press/release, valid/invalid actions, repeat prefix, held modifiers, cancel, nested cancellation, focus changes, and forwarding.

An accessible keyboard-only escape from capture is mandatory. A visible button alone is insufficient if the keyboard cannot reach it. Do not hijack Escape or Tab when their authentic context requires them. The exact non-conflicting release affordance remains a feasibility blocker.

## Determinism and time

The same version manifest, initial state, and external event sequence must yield identical simulation state, narrative facts, and assessment decisions.

External events identify run/attempt, sequence, origin, input profile, logical time, and payload. Derived facts additionally identify causal event, emitting subsystem, target identities, and outcome. A scripted focus change remains scripted.

Replay external inputs once and recompute derived facts. Do not replay both inputs and their already-derived effects. Disable clipboard writes, audio, navigation, and other host effects during replay.

The story clock advances only at declared, recorded narrative transitions. Rendering clocks and asynchronous fictional work scheduling cannot advance deadlines. Hidden, paused, or closed browser tabs do not run live Herdr processes; browser timers can be throttled or suspended [B9]. Resume uses the last committed logical state with no wall-clock catch-up penalty.

Use `performance.now()` only to measure runtime work [B10], not as hidden narrative or assessment authority.

## Assessment and narrative integration

Level contracts specify starting states, continuity, fidelity dependencies, objective action/result predicates, failure recovery, assistance policy, and checkpoint boundaries.

Completion needs appropriate player action and resulting state. For example, split credit requires an accepted player-origin split action linked to the intended tab's changed layout. A restored or scripted layout alone is insufficient.

Scope evidence to the attempt and target IDs. Distinguish rejected/no-op commands, keyboard, pointer, external accessible controls, demonstrations, and scripts. Keep story access separate from keyboard-transfer credit.

Client-local logs are educational records, not tamper-proof certification. Imported history cannot independently prove identity or authentic physical input.

## Presentation and accessibility

Designer-owned layout must project the pinned Herdr interface. Tutorial, transcript, accessibility, save, capture, and scene controls remain visibly external.

- Process accepted inputs in order independently of rendering; never debounce, throttle, or coalesce actions.
- Coalesce redundant paints only. Preserve focus/input nodes across unrelated redraws.
- Do not await animations before navigation. Correlate delayed effects to their original targets.
- Effects cannot falsify focus/status, conceal essential evidence, drop keys, or determine objective completion.
- Use semantic external controls, landmarks, labels, skip links, visible focus, and predictable reading order.
- Provide keyboard escape from every captured mode [A1]. Avoid blanket `role="application"`; it changes assistive-technology handling [A2].
- Announce important changes without streaming the entire terminal buffer as an aggressive live region [A3].
- Derive a navigable transcript from canonical facts without spoilers or missing evidence.
- Present status through text/shape and programmatic labels, not color alone.
- Reduced motion and pause/skip-reveal controls must preserve facts and assessment [A4].
- Verify 200% zoom without lost functionality [A5].

A transcript does not waive accessibility of the interactive surface. Automated checks cannot replace manual screen-reader and keyboard-only evaluation.

## Clipboard and safe fictional execution

Clipboard operations are host effects with actual success/failure. Secure-context, permission, and activation rules differ by browser [B11]. Request only needed access from the relevant user action; do not assume activation survives an animation.

Never read the clipboard in the background or claim a successful copy after denial. Keep fictional field cut buffers separate from the system clipboard. Permission denial must preserve progress. A manual-copy accommodation is labeled and cannot manufacture copy-mode credit.

Fictional commands use reviewed allowlists and deterministic responses. No `eval`, imported scripts, real shell/SSH/PTTY launch, real Herdr control, or arbitrary URL loading. Paste never auto-executes. Fictional paths are not host filesystem paths.

## Persistence and trust

Propose IndexedDB for transactional checkpoints and event journals [B13], without a wrapper dependency. Save manifests identify schema, rules, Herdr commit/profile, narrative/level/learning versions, input normalization version, attempt, and committed event sequence.

Save checkpoint and corresponding journal position consistently. Save during interaction and meaningful transitions, not only unload; shutdown can abort pending writes [B13]. Display failures and last committed position.

Storage can be evicted or deleted and is not a backup [B14]. Offer explicit export. Preserve original saves before migrations, reject unknown future schemas without deletion, and never silently reinterpret old assessment evidence under new rules.

Detect conflicting same-run writes using an expected sequence inside a transaction. Resolve through explicit selection or forking rather than merging assessment histories.

Imports are untrusted. Bound size/replay cost; validate schemas, references, versions, identifiers, allowed event kinds, and invariants. Reject executable content, arbitrary URLs, and prototype-pollution keys. Reconstruct validated state rather than blindly merging objects or rendering imported HTML.

Confirm before overwriting progress. Checksums detect accidental corruption, not trustworthy authorship.

## Deployment, measurement, and upgrades

Propose self-contained static HTTPS assets, without accounts, analytics, backend, cloud saves, service workers, external fonts, or runtime CDNs. Keep active-run assets and content/rules on compatible version manifests.

No runtime performance was measured. After authorization, establish budgets on named hardware and a worst-case scene: input-transition latency, dropped/duplicate/misrouted actions, render long tasks with effects/zoom/transcript, output/log growth, persistence latency, and bounded import/replay.

Start with bounded main-thread work. Add workers or virtualization only for a measured need and after checking fidelity/accessibility.

Freeze the upstream baseline per learning edition. Upgrades require source/doc diffs, fidelity fixtures, affected browser tests, learning/narrative reconciliation, and an explicit save/replay compatibility decision.

Herdr's inspected root license is Apache-2.0 [H2]. Copying source/docs needs applicable notices, attribution, and change declarations; asset/dependency licenses and trademarks need separate checks. Establish Yazi licensing before copying anything. Do not imply endorsement.

## Gates and stop criteria

1. **Design review:** complete and review research, story/ending, fifteen levels, learning matrix, alternatives, risks, and acceptance plan. User approval is required before any prototype.
2. **Authorized feasibility study:** smallest non-content input/fidelity prototype. Derive the event/context matrix from taught skills. Record OS/browser build, keyboard/layout, assistive technology, host, permissions, and deployment mode.
3. **Authorized vertical slice:** only after feasibility passes and implementation is approved. Verify domain transitions, narrative/assessment independence, replay, persistence and one integrated workflow.
4. **Content/release:** validate all levels, checkpoints, cumulative mastery, recovery, fidelity fixtures, and the published support envelope.

Physical-key testing is mandatory for interception claims; synthetic events do not prove an event survives its host.

Stop if required authentic input cannot be delivered, replacement shortcuts are needed, keys are lost/misrouted, cancellation/focus is wrong, capture has no keyboard escape, essential accessibility fails, required clipboard behavior cannot succeed honestly, or a relevant source contract remains disputed.

Respond with a narrower explicitly approved envelope or revised product proposal. Do not silently redefine authenticity.

## Evidence

Web-platform references describe APIs; they are not project runtime results.

| ID | Source |
|---|---|
| H1 | [Pinned Herdr keyboard guide](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/keyboard.mdx#L12-L140) |
| H2 | [Herdr license](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/LICENSE#L89-L141) |
| B1 | [Chrome keyboard shortcuts](https://support.google.com/chrome/answer/157179?hl=en) |
| B2 | [Firefox accelerator binding](https://github.com/mozilla-firefox/firefox/blob/05ea3f8e9fd32050f86babe19eddc88e77a1ca64/browser/base/content/browser-sets.inc.xhtml#L296-L298), [key value](https://github.com/mozilla-firefox/firefox/blob/05ea3f8e9fd32050f86babe19eddc88e77a1ca64/browser/locales/en-US/browser/browserSets.ftl#L167-L168) |
| B3 | [MDN preventDefault](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault) |
| B4 | [MDN Keyboard.lock](https://developer.mozilla.org/en-US/docs/Web/API/Keyboard/lock) |
| B5 | [Chrome Keyboard Lock](https://developer.chrome.com/docs/capabilities/web-apis/keyboard-lock) |
| B6 | [Keyboard Lock specification](https://wicg.github.io/keyboard-lock/) |
| B7 | [MDN KeyboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent) |
| B8 | [MDN beforeinput](https://developer.mozilla.org/en-US/docs/Web/API/Element/beforeinput_event) |
| B9 | [Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API), [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) |
| B10 | [performance.now](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now) |
| B11 | [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) |
| B12 | [React render/commit](https://react.dev/learn/render-and-commit) |
| B13 | [Using IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB) |
| B14 | [Storage quotas/eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) |
| A1 | [WCAG no keyboard trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html) |
| A2 | [ARIA application role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/application_role) |
| A3 | [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) |
| A4 | [WCAG interaction animation](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) |
| A5 | [WCAG resize text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) |

Unverified: browser capture, capture-release gesture, clipboard envelope, runtime performance, accessibility conformance, learner transfer, and final cross-document reconciliation. These remain release blockers, not completed tests.

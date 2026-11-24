import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  createScenario,
  createStore,
  replay,
  type HerdrState,
  type InputEvent,
  type Modifier,
} from "../src/core/herdr";

const MODIFIERS: Modifier[] = ["ctrl", "alt", "shift", "meta"];
const KEYS = [
  "b",
  "h",
  "j",
  "k",
  "l",
  "c",
  "n",
  "p",
  "v",
  "minus",
  "x",
  "z",
  "q",
  "w",
  "g",
  "[",
  "escape",
  "enter",
  "up",
  "down",
  "/",
  "?",
  "a",
  "1",
  "9",
] as const;

const keyEvent = (key: string, modifiers: Modifier[] = []): InputEvent => ({
  kind: "key",
  origin: "player",
  key,
  modifiers,
  phase: "press",
});

const arbitraryKey: fc.Arbitrary<InputEvent> = fc
  .record({
    key: fc.constantFrom(...KEYS),
    modifiers: fc.subarray(MODIFIERS),
  })
  .map(({ key, modifiers }) => keyEvent(key, [...modifiers]));

const arbitraryEvent: fc.Arbitrary<InputEvent> = fc.oneof(
  arbitraryKey,
  fc.constant<InputEvent>({ kind: "host", origin: "host", host: "blur" }),
  fc.constant<InputEvent>({ kind: "host", origin: "host", host: "focus" }),
  fc.constant<InputEvent>({ kind: "host", origin: "host", host: "reattach" }),
  fc
    .record({
      paneId: fc.constantFrom("p1", "p2", "p3"),
      state: fc.constantFrom("idle", "working", "blocked", "unknown"),
    })
    .map<InputEvent>(({ paneId, state }) => ({
      kind: "process",
      origin: "process",
      process: { kind: "agentState", paneId, state },
    })),
);

function stateOf(level: 1 | 2 | 3, events: readonly InputEvent[]): HerdrState {
  return replay(createScenario(level), events);
}

describe("property: replay determinism", () => {
  it("replay(dispatch(seq)) equals dispatch(seq) for arbitrary sequences", () => {
    fc.assert(
      fc.property(fc.array(arbitraryEvent, { maxLength: 40 }), (events) => {
        const direct = createStore(createScenario(1));
        for (const event of events) direct.dispatch(event);
        expect(replay(createScenario(1), events)).toEqual(direct.getState());
      }),
    );
  });

  it("the journal is ordered and every entry is replayable", () => {
    fc.assert(
      fc.property(fc.array(arbitraryEvent, { maxLength: 20 }), (events) => {
        const state = stateOf(2, events);
        expect(state.journal.map((e) => e.seq)).toEqual(events.map((_, i) => i));
        expect(state.journal.map((e) => e.event)).toEqual(events);
      }),
    );
  });
});

describe("property: blur voids a pending prefix", () => {
  it("a blurred prefix never completes an action and never records a failure", () => {
    fc.assert(
      fc.property(fc.constantFrom(...KEYS), fc.subarray(MODIFIERS), (key, modifiers) => {
        const s = createStore(createScenario(1));
        s.dispatch(keyEvent("b", ["ctrl"]));
        const voided = s.dispatch({ kind: "host", origin: "host", host: "blur" });
        expect(voided.effect).toBe("prefix-voided");
        expect(s.getState().mode).toBe("terminal");
        // The follow-up key is now ordinary terminal input, never a prefix action.
        const entry = s.dispatch(keyEvent(key, modifiers));
        expect(entry.effect).not.toBe("prefix-resolved");
        expect(entry.effect).not.toBe("prefix-consumed");
        // No failure is recorded anywhere: the journal has no failure effect.
        expect(s.getState().journal.some((e) => (e.effect as string) === "failed")).toBe(false);
      }),
    );
  });
});

describe("property: provenance guard", () => {
  it("a scripted or simulated process event can never be a player action", () => {
    fc.assert(
      fc.property(fc.array(arbitraryEvent, { maxLength: 30 }), (events) => {
        const s = createStore(createScenario(1));
        for (const event of events) {
          const entry = s.dispatch(event);
          const playerOrigin = event.kind === "key" && event.origin === "player";
          expect(entry.playerAction).toBe(playerOrigin);
        }
      }),
    );
  });

  it("a process event cannot claim player origin", () => {
    const s = createStore(createScenario(1));
    expect(() =>
      s.dispatch({
        kind: "process",
        origin: "player",
        process: { kind: "agentState", paneId: "p1", state: "idle" },
      }),
    ).toThrow(RangeError);
  });

  it("a key event cannot claim process origin", () => {
    const s = createStore(createScenario(1));
    expect(() =>
      s.dispatch({ kind: "key", origin: "process", key: "b", modifiers: ["ctrl"], phase: "press" }),
    ).toThrow(RangeError);
  });
});

describe("property: copy-mode entry is sequential prefix+[", () => {
  it("prefix then [ enters copy mode from a documented Terminal precondition", () => {
    // Genuine precondition (input.rs:633-639, :667-680): overlay routing and
    // non-Terminal modes take precedence, so prefix+[ only enters copy from
    // Terminal mode with no overlay. No escape/blur "reset" is used: Esc in a
    // confirmation overlay enters Navigate, so it is not a reset.
    fc.assert(
      fc.property(fc.array(arbitraryEvent, { maxLength: 10 }), (prefixEvents) => {
        const sequential = createStore(createScenario(1));
        for (const event of prefixEvents) sequential.dispatch(event);
        const before = sequential.getState();
        if (before.mode !== "terminal" || before.overlay !== null || !before.attached) return;
        sequential.dispatch(keyEvent("b", ["ctrl"]));
        sequential.dispatch(keyEvent("["));
        expect(sequential.getState().mode).toBe("copy");
      }),
    );
  });

  it("Ctrl+[ alone never enters copy mode", () => {
    const plain = createStore(createScenario(1));
    plain.dispatch(keyEvent("[", ["ctrl"]));
    expect(plain.getState().mode).toBe("terminal");
    expect(plain.getState().copy).toBeNull();
  });

  it("regression: prefix+x, prefix+x, esc, ctrl+b, [ stays terminal", () => {
    // Reviewer counterexample: the first prefix+x raises the confirmation gate,
    // the second is routed to the overlay, Esc cancels it into Navigate, and
    // prefix inside Navigate cancels to Terminal (input.rs:754, :930-934).
    const s = createStore(createScenario(3));
    s.dispatch(keyEvent("b", ["ctrl"]));
    s.dispatch(keyEvent("x"));
    expect(s.getState().overlay?.kind).toBe("confirmClose");
    s.dispatch(keyEvent("b", ["ctrl"]));
    s.dispatch(keyEvent("x"));
    s.dispatch(keyEvent("escape"));
    expect(s.getState().mode).toBe("navigate");
    s.dispatch(keyEvent("b", ["ctrl"]));
    expect(s.getState().mode).toBe("terminal");
    s.dispatch(keyEvent("["));
    expect(s.getState().mode).toBe("terminal");
    expect(s.getState().copy).toBeNull();
  });
});

describe("adversarial: objectives cannot be forged", () => {
  it("no non-player origin can produce a player-action journal entry", () => {
    const s = createStore(createScenario(1));
    const forged: InputEvent[] = [
      { kind: "key", origin: "script", key: "b", modifiers: ["ctrl"], phase: "press" },
      { kind: "key", origin: "fixture", key: "h", modifiers: [], phase: "press" },
      {
        kind: "process",
        origin: "process",
        process: { kind: "output", paneId: "p1", line: "done" },
      },
      { kind: "host", origin: "host", host: "intercepted", key: "b", modifiers: ["ctrl"] },
    ];
    for (const event of forged) {
      const entry = s.dispatch(event);
      expect(entry.playerAction).toBe(false);
    }
    expect(s.getState().journal.every((e) => !e.playerAction)).toBe(true);
  });

  it("a host-intercepted prefix never arms prefix mode", () => {
    const s = createStore(createScenario(1));
    const entry = s.dispatch({
      kind: "host",
      origin: "host",
      host: "intercepted",
      key: "b",
      modifiers: ["ctrl"],
    });
    expect(entry.effect).toBe("none");
    expect(s.getState().mode).toBe("terminal");
  });

  it("a fabricated fixture event cannot advance a level objective", () => {
    // Objective predicates live in src/core/assessment; here we prove the
    // journal cannot be forged from non-player origins, which is the only
    // input the assessment layer may credit. A fixture event may change state
    // (pre-created state is legitimate) but never carries the player marker.
    const s = createStore(createScenario(3));
    s.dispatch({ kind: "key", origin: "fixture", key: "b", modifiers: ["ctrl"], phase: "press" });
    s.dispatch({ kind: "key", origin: "fixture", key: "v", modifiers: [], phase: "press" });
    expect(s.getState().journal.every((e) => !e.playerAction)).toBe(true);
    expect(s.getState().journal.map((e) => e.effect)).toEqual(["prefix-armed", "prefix-resolved"]);
    expect(s.getState().journal.map((e) => e.action)).toEqual(["prefix", "split-right"]);
  });
});

describe("property: snapshots are immutable", () => {
  it("a snapshot is deeply frozen and stable between dispatches", () => {
    const s = createStore(createScenario(1));
    const first = s.snapshot();
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.workspaces)).toBe(true);
    expect(s.snapshot()).toBe(first);
    s.dispatch(keyEvent("b", ["ctrl"]));
    expect(s.snapshot()).not.toBe(first);
    expect(Object.isFrozen(s.snapshot())).toBe(true);
  });

  it("subscribe returns a stable unsubscribe", () => {
    const s = createStore(createScenario(1));
    let calls = 0;
    const unsubscribe = s.subscribe(() => {
      calls += 1;
    });
    s.dispatch(keyEvent("b", ["ctrl"]));
    expect(calls).toBe(1);
    unsubscribe();
    s.dispatch(keyEvent("escape"));
    expect(calls).toBe(1);
  });
});

describe("property: detached client is inert (M1)", () => {
  it("no key event mutates state or forwards while detached", () => {
    fc.assert(
      fc.property(fc.array(arbitraryKey, { maxLength: 20 }), (events) => {
        const s = createStore(createScenario(1));
        s.dispatch(keyEvent("b", ["ctrl"]));
        s.dispatch(keyEvent("q"));
        expect(s.getState().attached).toBe(false);
        const before = s.getState();
        for (const event of events) {
          const entry = s.dispatch(event);
          expect(entry.playerAction).toBe(false);
          expect(entry.effect).toBe("none");
        }
        const after = s.getState();
        expect(after.workspaces).toEqual(before.workspaces);
        expect(after.mode).toBe(before.mode);
        expect(after.copy).toEqual(before.copy);
      }),
    );
  });

  it("reattach is the only event that changes a detached session", () => {
    const s = createStore(createScenario(1));
    s.dispatch(keyEvent("b", ["ctrl"]));
    s.dispatch(keyEvent("q"));
    // The mode bar is hidden while detached (no composed surface).
    expect(s.snapshot().modeBar.visible).toBe(false);
    s.dispatch({ kind: "host", origin: "host", host: "reattach" });
    expect(s.getState().attached).toBe(true);
    s.dispatch(keyEvent("b", ["ctrl"]));
    expect(s.getState().mode).toBe("prefix");
    expect(s.snapshot().modeBar.visible).toBe(true);
  });
});

describe("property: event objects are copied at the boundary (M6)", () => {
  it("reusing one mutable event object across dispatches works", () => {
    const s = createStore(createScenario(1));
    const event: InputEvent = {
      kind: "key",
      origin: "player",
      key: "b",
      modifiers: ["ctrl"],
      phase: "press",
    };
    const mutable = { ...event, modifiers: [...event.modifiers] };
    s.dispatch(mutable);
    expect(s.getState().mode).toBe("prefix");
    // Mutate the caller's object after dispatch: the journal must not alias it.
    mutable.key = "z";
    mutable.modifiers.push("shift");
    const journal = s.journal();
    expect(journal[0]?.event).toEqual(event);
    expect(journal[0]?.event).not.toBe(mutable);
    // Reuse the same object for a second dispatch.
    s.dispatch(mutable);
    expect(s.getState().mode).toBe("terminal");
    expect(s.journal()).toHaveLength(2);
  });
});

describe("property: inert events keep snapshot identity (M7)", () => {
  it("N inert dispatches produce N identical snapshot identities", () => {
    const s = createStore(createScenario(1));
    const first = s.snapshot();
    for (let i = 0; i < 5; i += 1) {
      s.dispatch({ kind: "key", origin: "player", key: "h", modifiers: [], phase: "repeat" });
      expect(s.snapshot()).toBe(first);
    }
    // A real transition does change identity.
    s.dispatch(keyEvent("b", ["ctrl"]));
    expect(s.snapshot()).not.toBe(first);
  });

  it("the journal is append-only and frozen per entry", () => {
    const s = createStore(createScenario(1));
    s.dispatch(keyEvent("b", ["ctrl"]));
    const journal = s.journal();
    expect(Object.isFrozen(journal)).toBe(true);
    expect(Object.isFrozen(journal[0])).toBe(true);
    s.dispatch(keyEvent("escape"));
    expect(s.journal()).not.toBe(journal);
    expect(s.journal()[0]).toBe(journal[0]);
  });
});

describe("property: journal action names (M8)", () => {
  it("every entry carries a resolved action name", () => {
    const s = createStore(createScenario(1));
    const names = [
      s.dispatch(keyEvent("b", ["ctrl"])).action,
      s.dispatch(keyEvent("?")).action,
      s.dispatch(keyEvent("escape")).action,
      s.dispatch(keyEvent("b", ["ctrl"])).action,
      s.dispatch(keyEvent("Q")).action,
    ];
    expect(names).toEqual(["prefix", "help", "help-close", "prefix", "invalid-consumed"]);
  });

  it("split and workspace navigation are named", () => {
    const s = createStore(createScenario(3));
    s.dispatch(keyEvent("b", ["ctrl"]));
    expect(s.dispatch(keyEvent("v")).action).toBe("split-right");
    s.dispatch(keyEvent("b", ["ctrl"]));
    expect(s.dispatch(keyEvent("w")).action).toBe("workspace-picker");
    expect(s.dispatch(keyEvent("down")).action).toBe("workspace-nav");
  });
});

describe("property: navigate mode (M10)", () => {
  it("workspace up/down wraps on desktop (workspace_navigation.rs:143-158)", () => {
    // Two workspaces so wrap is distinguishable from clamp.
    const base = createScenario(1);
    const first = base.workspaces[0];
    if (!first) throw new Error("scenario needs a workspace");
    const second = { ...first, id: "w2", name: "second" };
    const initial = { ...base, workspaces: [first, second] };
    const s = createStore(initial);
    s.dispatch(keyEvent("b", ["ctrl"]));
    s.dispatch(keyEvent("w"));
    expect(s.getState().navigateSelection).toBe(0);
    // Up from the first wraps to the last (rem_euclid, not clamp).
    s.dispatch(keyEvent("up"));
    expect(s.getState().navigateSelection).toBe(1);
    // Down from the last wraps to the first.
    s.dispatch(keyEvent("down"));
    expect(s.getState().navigateSelection).toBe(0);
  });

  it("prefix inside navigate mode cancels navigate (input.rs:754)", () => {
    const s = createStore(createScenario(1));
    s.dispatch(keyEvent("b", ["ctrl"]));
    s.dispatch(keyEvent("w"));
    expect(s.getState().mode).toBe("navigate");
    s.dispatch(keyEvent("b", ["ctrl"]));
    // cancel_navigate -> copy_or_terminal_mode (input.rs:930-934): Terminal,
    // not Prefix.
    expect(s.getState().mode).toBe("terminal");
  });
});

describe("assumption: blur does not dismiss overlays", () => {
  it("blur during help leaves the overlay open (input.rs:328-336)", () => {
    // ASSUMPTION (FIDELITY Unresolved #2): the decided policy covers a pending
    // prefix only. Upstream OuterFocusLost releases input leases and clears
    // link hover; it does not touch `self.overlay`.
    const s = createStore(createScenario(1));
    s.dispatch(keyEvent("b", ["ctrl"]));
    s.dispatch(keyEvent("?"));
    expect(s.getState().overlay?.kind).toBe("help");
    s.dispatch({ kind: "host", origin: "host", host: "blur" });
    expect(s.getState().overlay?.kind).toBe("help");
    // The overlay still routes keys afterwards.
    s.dispatch(keyEvent("escape"));
    expect(s.getState().overlay).toBeNull();
  });
});

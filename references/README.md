# Project References & Evidence

This directory consolidates non-application reference collateral, upstream behavioral baselines, research probes, concept art, and capture tooling for **The Mandate: Herdr**.

---

## Directory Index

| Subdirectory | Purpose | Authority Level |
| :--- | :--- | :--- |
| [`herdr-baselines/`](./herdr-baselines/) | Pinned Herdr (v0.9.5) baseline PNG captures, tmux transcripts, SHA-256 manifest, and narrative transcripts | **Authoritative visual & behavioral baseline** |
| [`illustrative/`](./illustrative/) | Third-party terminal screenshots (TermSplit) and community fork blog images | **Illustrative only (non-authority)** |
| [`feasibility/`](./feasibility/) | M1 keyboard feasibility probe (`keyboard-probe.html`) | **Historical M1 gate artifact** |
| [`concept-art/`](./concept-art/) | Extracted concept art renders for tone and atmosphere | **Illustrative tone collateral** |
| [`scripts/`](./scripts/) | Baseline capture harness and isolation verification scripts | **Offline tooling & harnesses** |

---

## Behavioral and Visual Authority

The authority hierarchy for interface behavior is strictly enforced:
1. **Pinned Upstream Herdr Source & Binaries**: Commit `e8d7d9705a7a2c89cef4dd42079379f05685af87` (v0.9.5).
2. **Authoritative Baselines** in [`herdr-baselines/`](./herdr-baselines/): 32 measured interface states captured in an isolated Xvfb/Ghostty session.
3. **Illustrative Reference**: Images in [`illustrative/`](./illustrative/) must **never** be used as behavioral authority or visual regression targets.

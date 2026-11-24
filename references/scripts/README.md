# Baseline Capture & Isolation Scripts

This directory contains offline developer harnesses and isolation verification utilities for upstream Herdr baselines.

---

## Tooling

| Script | Purpose | Documentation |
| :--- | :--- | :--- |
| [`capture-upstream-baselines.sh`](./capture-upstream-baselines.sh) | Generates the 32 visual-regression baseline PNGs and tmux screen transcripts from a pinned build of Herdr 0.9.5 | [`capture-upstream-baselines.README.md`](./capture-upstream-baselines.README.md) |
| [`herdr-isolation-probe.sh`](./herdr-isolation-probe.sh) | Probes Herdr server socket isolation to verify named sessions do not terminate host sessions | Inline comments |

---

## Safety Contract

A second Herdr instance can kill the user's live default-session server if not isolated. All capture scripts must run with a private `--session capture-<id>` and private `XDG_CONFIG_HOME`. `server stop` must **never** be executed by any automated script.

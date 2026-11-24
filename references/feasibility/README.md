# Keyboard Feasibility Probe (Milestone 1)

This directory contains the standalone keyboard feasibility probe deliverable for **Milestone 1 (M1)**:
- File: [`keyboard-probe.html`](./keyboard-probe.html)

## Purpose & Context

Before any React presentation or gameplay implementation was authorized (M0/M1 gates), the keyboard feasibility study proved that browser event routing could deliver authentic Herdr chords (including prefix sequences like `ctrl+b`, sequential modes, and vim navigation keys) across browsers.

## Gate Status

**CLOSED & ACCEPTED (2026-11-23)**
- Full results are documented in [docs/FEASIBILITY_KEYBOARD.md](../../docs/FEASIBILITY_KEYBOARD.md) and [docs/M1_EXIT_REPORT.md](../../docs/M1_EXIT_REPORT.md).
- Formal user acceptance recorded in [docs/adr/0005-gate1-envelope-accepted-by-user-authorization.md](../../docs/adr/0005-gate1-envelope-accepted-by-user-authorization.md).

## Usage

Open `keyboard-probe.html` directly in any web browser without a web server to verify low-level keyboard chord interception and keydown event capture.

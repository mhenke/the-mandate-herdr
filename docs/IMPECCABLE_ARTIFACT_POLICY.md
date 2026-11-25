# Impeccable artifact tracking

**Recommendation:** track Impeccable's durable, team-shared product/design context and project settings. Do not track the entire `.impeccable/` tree; it mixes those files with machine-specific paths and runtime output.

## Artifact decisions

| Artifact | Track? | Basis |
|---|---:|---|
| `PRODUCT.md`, `DESIGN.md` | Yes | Product truth and the visual system are inputs to later Impeccable work. `init` writes `PRODUCT.md`; `document` writes root `DESIGN.md`. |
| `.impeccable/config.json` | Yes | Project-level workflow and detector settings are shared. Impeccable distinguishes these from per-developer overrides. |
| `.impeccable/design.json` | Yes | The generated sidecar carries design-system extensions and component examples used with `DESIGN.md`; the document workflow says to regenerate it with `DESIGN.md`. |
| `.impeccable/live/config.json` | Yes, when Live is configured | Impeccable's init completion list names it as a commit candidate. It describes project HTML injection, not a developer's absolute checkout path. |
| `.impeccable/surfaces/*.md` | Yes, when present | Surface briefs are project design decisions and are listed among files to commit. |
| `.impeccable/critique/ignore.md` | Yes, when present | Explicitly listed as shareable exception policy. Keep other per-run critique output local. |
| `.impeccable/config.local.json` | No | Per-developer overrides and hook-consent state; Impeccable explicitly keeps it on the developer's machine. |
| `.impeccable/live/roots.json` | No | Upstream says Live writes a root manifest; this checkout's manifest contains absolute `/home/...` paths. Treat it as machine/worktree-specific. Upstream's current ignore file does not explicitly name `roots.json`, so this is a repository-specific recommendation based on the file's contents. |
| `.impeccable/hook.cache.json`, `.impeccable/audit/*`, Live sessions/previews/server/worker state | No | Runtime caches, reports, and recovery state. Upstream's ignore policy excludes hook cache, local critique snapshots, and Live runtime state. This repo's `.impeccable/audit/.gitignore` also labels its audit output local runtime state. |

The names `config.json` refer to two different files: the root `.impeccable/config.json` is shared project configuration; `.impeccable/live/config.json` is Live's project injection configuration. Both are distinct from `config.local.json`.

## Ignore-rule direction

Replace the blanket `.impeccable/` ignore with an allowlist for shared files and targeted ignores for runtime state. For example:

```gitignore
# Impeccable: share durable product/design context; keep runtime state local.
.impeccable/*
!.impeccable/config.json
!.impeccable/design.json
!.impeccable/live/
.impeccable/live/*
!.impeccable/live/config.json
!.impeccable/surfaces/
!.impeccable/critique/
.impeccable/critique/*
!.impeccable/critique/ignore.md
```

This leaves `config.local.json`, `live/roots.json`, `hook.cache.json`, audit output, and other unlisted runtime files ignored while allowing the documented shared artifacts. Git requires re-including ignored parent directories before it can re-include their files; the pattern order above does that for `live/` and `critique/`.

## Evidence and limits

- [Impeccable init reference](https://github.com/pbakaus/impeccable/blob/main/.agents/skills/impeccable/reference/init.md) distinguishes shared `config.json` from local `config.local.json`, lists the files to commit, and warns that blanket `.impeccable/` ignores shared artifacts.
- [Impeccable document reference](https://github.com/pbakaus/impeccable/blob/main/.agents/skills/impeccable/reference/document.md) defines root `DESIGN.md` and the `.impeccable/design.json` sidecar, and says to regenerate the sidecar with the design document.
- [Impeccable hooks reference](https://github.com/pbakaus/impeccable/blob/main/skill/reference/hooks.md) states that shared hook/detector settings live in `.impeccable/config.json`; developer overrides live in ignored `config.local.json`.
- [Impeccable Live reference](https://github.com/pbakaus/impeccable/blob/main/skill/reference/live.md) says Live persists its resolved app root in `.impeccable/live/roots.json`. The recommendation to ignore this manifest is repo-specific: it records absolute local paths, and the upstream `.gitignore` does not explicitly classify `roots.json`.
- [Impeccable upstream `.gitignore`](https://github.com/pbakaus/impeccable/blob/main/.gitignore) tracks selected project-side configuration/design artifacts while excluding local config, caches, and Live recovery/runtime files. It is the Impeccable source repository's policy; consuming projects should adapt it, not copy every rule verbatim.

## This repository now

The project tracks `PRODUCT.md`. `DESIGN.md` and the shared root config, design sidecar, and Live config are now selected for tracking. `.gitignore` uses targeted rules to expose those artifacts while keeping local and generated state ignored.

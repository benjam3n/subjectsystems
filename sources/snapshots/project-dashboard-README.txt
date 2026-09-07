# project-dashboard

Unified desktop app for running reasoning/AI tools from one place. Flutter desktop UI talking to a local FastAPI backend that invokes scripts and calls Groq.

## Layout

```
project-dashboard/
├── ui/          Flutter desktop app (Linux)
├── backend/     FastAPI on localhost; invokes scripts, calls Groq, stores history
├── scripts/     Copies of runnable scripts from the source projects, adapted to Groq
└── data/        Local state: run history SQLite, cached outputs
```

## What it does

Three integration patterns:

1. **Skill runner** — sends a reasoningtool/superintelbot/GOSM SKILL.md as system prompt + user input to Groq, returns the response.
2. **Script runner** — invokes a Python CLI (TruthFinder, PreferenceFinder, AxiomNet, LogicSystem, postagi-reasoning) with user-supplied args, streams stdout.
3. **Compare** — sends one input to N tools side-by-side so you can see which produces the most useful output.

All runs land in a local SQLite history so you can re-open past work.

## Prerequisites

- Flutter (stable channel, Linux desktop enabled)
- Python 3.11+
- PostgreSQL (only needed for AxiomNet and LogicSystem tools)
- `GROQ_API_KEY` in env, `.env`, or `~/.bashrc`

## Status

Scaffolding. Previous Next.js implementation is preserved on the `nextjs-snapshot` branch.

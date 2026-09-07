# SDS - Selection Design System

A design methodology where AI generates diverse options, the human selects what resonates, and AI generates more options informed by those selections. Design-first, requirements-second.

## Core Loop

```
/gen (generate diverse designs)
  → human selects favorites
    → /iterate (refine based on selections, generate new variants)
      → human selects again
        → ... repeat until design converges ...
          → /requirements (extract requirements FROM the converged design)
            → /sel (final selection with feasibility check)
```

## Key Insight

Traditional: requirements → design → selection
SDS: design → selection → more design → ... → extract requirements from what emerged

Requirements are discovered through design exploration, not prescribed upfront.

## Relevant Skills

| Phase | Skill | Purpose |
|-------|-------|---------|
| Generate | `/gen` | Produce diverse candidates (conventional, unconventional, extreme) |
| Design | `/dsn` | Apply design principles, generate artifacts |
| Select | User choice | Human picks favorites from generated options |
| Iterate | `/iterate` | Refine based on selections, identify what to change |
| Requirements | `/requirements` | Extract requirements from converged design |
| Final Select | `/sel` | Final commitment with feasibility assessment |
| Compare | `/cmp` | Side-by-side comparison when choosing between close options |
| Critique | `/cri` | Evaluate individual designs for weaknesses |

## Projects

- [robotics/](robotics/) - Robot design exploration

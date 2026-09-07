# Discovery Engine

Discovery Engine is now a hierarchy of discoveries, not a database of model
responses.

The canonical structure is [discoveries/everything.md](discoveries/everything.md).
It begins:

```text
Everything everything discovery
└─ Everything discovery discovery
   ├─ Existence, nonexistence, and possibility discovery
   ├─ Truth, falsity, certainty, and answers discovery
   ├─ Distinction, relationship, and organization discovery
   ├─ Importance, usefulness, and goals discovery
   ├─ Problems, solutions, actions, and outcomes discovery
   ├─ Actors, perspectives, and distribution of discoveries discovery
   └─ Discovery discovery
```

Those branches are not prose categories outside the system. Each one is itself an
unresolved discovery. Every indented item is another discovery expected to
contribute to the discovery immediately above it in the current view.

## What the notation means

- `[ ]` means the discovery is unresolved under its current scope.
- `[x]` means it has been discovered well enough under its current scope.
- `[>]` means the exact same discovery is canonical elsewhere and also contributes
  here; it is a reference, not a copied discovery.
- Indentation means “this discovery currently contributes directly to the discovery
  above it in this view.” It may expose purpose, broader scope, narrower context,
  alternatives, prerequisites, evidence, methods, or results.
- An unchecked placement is provisional. It can be reorganized; it is not a claim
  that the placement has already been proved correct.

There is no `discovered_content`, summary, reason, ID, role, score, response type,
or hidden second representation. A useful finding becomes a checked discovery. If
the finding has useful parts, those parts become checked lower-level discoveries.

Read [RULES.md](RULES.md) for the complete rules.

## View what is here

Python 3.11 or newer is sufficient; there are no dependencies to install.

```bash
python tools/discovery.py check
python tools/discovery.py show "Everything discovery discovery" --depth 2
python tools/discovery.py find "method"
python tools/discovery.py path "Much can be improved discovery"
```

To see every unresolved leaf beneath a discovery without pretending that one has
already been chosen correctly:

```bash
python tools/discovery.py frontier "Discovery discovery"
```

## Use it with Codex

Open the repository in Codex and prompt it with an exact discovery name:

> Work on `Much can be improved discovery`. Follow AGENTS.md. Inspect its current
> path and branch, then make one useful discovery step.

For hierarchy work:

> Expand `Discovery organization discovery` by the smallest useful step. Keep every
> conceptual item as a discovery and edit the canonical tree directly.

For the worked example:

> Work on `Good money making methods discovery`. Begin with why it is wanted and
> which higher-level goals it serves. Use those discoveries to determine which
> scope, possibility-space, evaluation, verification, and search discoveries are
> useful. Do not treat personal and actor-general purposes as isolated branches.

For new information:

> Reorganize the affected discoveries using this new information: … Preserve the
> exact discovery wording and do not add a summary.

Codex reads the tree, performs the work with its available tools when needed, edits
the Markdown, and runs the validator. You do not handle candidate objects or model
JSON.

## Use it with any model API

Generate a bounded Markdown request:

```bash
python tools/discovery.py context \
  "Much can be improved discovery" \
  --task expand > request.md
```

Send `request.md` to any model API. The request contains:

1. the discovery rules;
2. the requested kind of work;
3. the exact target;
4. its path from `Everything everything discovery`;
5. its current connected discoveries;
6. its immediate surroundings; and
7. the existing discovery names, so the model can avoid duplicates.

The model is asked for one of only four useful outputs:

- `expand`: a unified diff adding the smallest needed connected discoveries;
- `discover`: a unified diff recording actual discovery progress;
- `reorganize`: a unified diff changing only the affected hierarchy;
- `choose-next`: one exact existing discovery name, or a diff expanding the still
  unresolved selection procedure.

This contract is plain Markdown and a standard unified diff, so it is not tied to a
particular model vendor. After applying a proposed diff, run:

```bash
python tools/discovery.py check
```

## Use the read-only HTTP API

```bash
python tools/discovery.py serve
```

It serves Markdown rather than a parallel JSON object model:

```text
GET /tree
GET /show?name=Much%20can%20be%20improved%20discovery
GET /frontier?name=Discovery%20discovery
GET /context?name=Much%20can%20be%20improved%20discovery&task=expand
```

The API and CLI are only views over the same Markdown file. Models and people edit
that one file; there is nothing else to synchronize.

## Add a high-level discovery

Place it beneath the smallest existing broader discovery that you are actually
prepared to treat as its current parent. If that placement itself is uncertain,
leave both discoveries unchecked and work on `How discoveries fit into each other
discovery` or add the exact relationship discovery that must be resolved.

Do not fill the tree by enumerating arbitrary topics. Expand only what is useful to
the discovery being worked on, then let new discoveries determine what should be
expanded or reorganized next.

## Worked non-isolated expansion

The seeded `Good money making methods discovery` branch connects all of these in one
place:

```text
Good money making methods discovery
├─ Why good money making methods are wanted discovery
│  ├─ Why I want good money making methods discovery
│  ├─ Why everyone might want good money making methods discovery
│  └─ Why money is wanted discovery
├─ Meaning of good money making methods discovery
├─ Intended scope of good money making methods discovery
├─ Money making method possibility space discovery
├─ Applicability of money making methods discovery
├─ Quality of money making methods discovery
├─ Money making method discovery search discovery
├─ Money making method verification discovery
└─ Navigation of money making method discoveries discovery
```

The purpose discoveries influence what `good` means. That meaning influences which
parts of all possible money making methods are relevant. Search outcomes then update
predictions about where valuable methods are likely to be found. The universal
possibility-space discovery can remain open while a useful context-specific
discovery is made.

View it with:

```bash
python tools/discovery.py show "Good money making methods discovery"
```

## Checks

```bash
python tools/discovery.py check
python -m unittest discover -s tests -v
python -m compileall -q tools tests
```

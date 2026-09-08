# ARAW: Assume Right / Assume Wrong

## What is ARAW?

ARAW = Assume Right / Assume Wrong. A method for exploring claims by testing what follows if they're true AND what alternatives exist if they're false.

## Why is ARAW needed?

**Standard approaches only find expected problems and expected solutions.**

When you prompt an LLM normally, it commits to an interpretation and runs with it. If your framing is wrong, the answer is wrong. If there's an alternative you didn't consider, you won't see it. The model finds what you (and it) expected to find.

### The Training Problem

LLMs are trained in ways that bias them toward expected outputs. Multiple factors contribute:

- **Training objectives**: Human feedback rewards outputs that satisfy expectations
- **Inference patterns**: Autoregressive sampling favors high-probability (conventional) tokens
- **Pattern frequency**: Common patterns are well-represented; rare combinations aren't

**The system tends not to consider options the user doesn't expect.** It reflects back what you expected to see - which is why LLMs can appear to "demonstrate" consciousness or agree with whatever framing you bring. The model learned patterns that satisfy typical requests.

**Simply asking for the unexpected doesn't work.** If you prompt "tell me something I don't expect," the model guesses what you want:
- It might give you a random fun fact ("Did you know octopuses have three hearts?")
- It might try something "quirky" or "surprising"
- It might give you trivia or counterintuitive statistics

The problem? **This is what most users actually want when they say "unexpected."** The model optimized for the typical interpretation - and for most users, that guess is correct.

**But structured requests can break this pattern.** You can get unexpected outputs through:
- **Constraints**: "Give me something that is NOT X, NOT Y, NOT Z" (diagonalization)
- **Specific reference classes**: "Something that would surprise an expert in [field]"
- **Forced alternatives**: "Assume what I said is wrong. What then?"

This is exactly what ARAW does.

### Examples: What Doesn't Work vs What Does

| Unstructured (Doesn't Work) | Why It Fails | Structured (Works) |
|-----------------------------|--------------|-------------------|
| "Surprise me" | Model gives expected "surprise" format | "Give me the option that is NOT obvious, NOT contrarian, NOT random" |
| "Be creative" | Model gives standard "creative" patterns | "Assume conventional approach fails. What else?" |
| "Think outside the box" | Model gives expected "outside box" moves | "What would someone from [different field] suggest?" |
| "Challenge my assumptions" | Gentle pushback, then agreement | "ASSUME WRONG: What if my premise is false?" |
| "What am I missing?" | Surface-level additions | "What would make an expert say I'm wrong?" |

### Why Writing Quality Suffers

**Input**: "Why does LLM writing feel generic?"

**Step 1 - Universalize**: What is this question an instance of?
- "Writing" → a thing/artifact
- "generic" → a state (one of many possible states: generic, distinctive, mixed, context-dependent...)
- "why" → request for causal explanation

**Universal form**: "Why is [thing]'s [quality] in [state]?"

**Step 2 - Derive from universal**: From this universal, what possibilities exist?
- The thing (writing) might not be the right category
- The quality (generic vs distinctive) might be undefined for this context
- The state might be misperceived (writing might not actually be generic)
- Multiple causes might exist (which one matters most?)
- The question might be wrong ("why generic" should be "how to improve")
- The state might be changing (improving/declining)

**Step 3 - Check which you expected**:
- "Multiple causes exist" → expected
- "Writing might not be generic" → probably unexpected (dissolution path)
- "Wrong question" → probably unexpected (reframe path)

**The actual answer**: Writing feels generic because the model defaults to high-probability outputs. But universalization revealed 6 logical possibilities before we even got to the specific answer.

**How ARAW helps**: Instead of just answering, ARAW universalizes the question first, derives all possibilities from the universal, then addresses the specific. This ensures you don't miss alternatives.

### How ARAW Breaks This Pattern

**ARAW uses universalization to find ALL possibilities, not just unexpected ones.**

The goal isn't to find "unexpected" things - that's subjective and varies by person. The goal is to find all logical possibilities by:
1. **Universalizing** the input (what is this an instance of?)
2. **Deriving** all possibilities from the universal
3. **Checking** which derivations were expected (calibration, not goal)

**How?** For any claim:
- **ASSUME RIGHT** → What's the universal form of this being true?
- **ASSUME WRONG** → From the universal, what other instances exist?

**Example**:
- Input: "Users want feature X"
- Universal: "Users want [something]" → "Agents have preferences about states"
- Derive: Users might want X, not-X, something else entirely, nothing, something they can't articulate...
- Check: Did I expect "something they can't articulate"? Maybe not.

**Why this works:** Universalization ensures completeness. If you derive from the universal form, you can't miss logical possibilities. Unexpected findings are a SIDE EFFECT of completeness, not the goal.

**The key difference from unstructured prompting:** Instead of asking "what would be surprising?", ARAW asks "what is this an instance of?" and "what other instances exist?" These are logical questions with objective answers.

**You don't need to know what alternatives to look for.** ARAW's universalization generates them. You provide a specific; ARAW finds the universal; derivation produces all instances automatically.

---

## Quick Start

### With Claude Code (Recommended)

```
/plugin marketplace add benjam3n/GOSM
/plugin install araw@gosm
```

Then use: `/araw "your claim"` or `/araw 4x "your claim"` for deeper analysis.

### Standalone

```bash
git clone https://github.com/benjam3n/ARAW.git
cd ARAW
claude
```

See [SETUP.md](SETUP.md) for more installation options.

---

## How does it work?

For any claim, two branches get explored with equal rigor:
- **ASSUME RIGHT**: What follows if this is true? What can we build on it?
- **ASSUME WRONG**: What alternatives exist? What would change?

Then it recurses - conclusions are also claims.

The process:
1. **Unbundle** - Separate bundled guesses into individual claims
2. **Test** - What follows if right? What alternatives if wrong?
3. **Filter** - CLOSED (no alternatives) or OPEN (has alternatives)
4. **Recurse** - Conclusions are claims too

## What input does it need?

Any input. You don't need a clear claim or worked-out assumptions. Incomplete sentences, vague feelings, decisions, requests - the system handles it.

**Evaluability check**: ARAW operates on claims that can be true or false. Many inputs aren't directly evaluable:

| Input Type | Evaluable? | Example |
|------------|------------|---------|
| Factual claim | YES | "The API is slow" |
| Belief | YES | "Users prefer X" |
| Decision/Intent | NO | "I need to quit my job" |
| Request | NO | "Help me with X" |
| Conclusion | NO | "I should do Y" |

For non-evaluable inputs, ARAW questions to extract the underlying claims, then ARAWs those.

## What can it do?

- Turn "I think X" into "I know X is true because Y"
- Turn "this is the only option" into "here are 5 options"
- Turn "I need X" into "I need X because I actually want Y"
- Turn "obviously Z" into "Z is true under conditions A, B, C"

## Why use it?

**When you're already right** — Know WHY you're right. Know the edge cases. Hold tested confidence instead of untested belief.

**When alternatives exist** — See options you hadn't considered. Understand trade-offs. Choose instead of default.

## What are claims and guesses?

**Claim** — A statement about what is true or what will work.

**Guess** — A claim that could be wrong.

| Type | Why it's a guess |
|------|------------------|
| Prediction | Claims something will happen. It might not. |
| Strategy | Claims an approach will work. It might not. |
| Goal | Claims this is what you want. You might be wrong. |
| Decision | Claims this is the right choice. Alternatives might be better. |

**Why examine guesses?** — Guesses that survive scrutiny are more likely to be correct than guesses that haven't been tested.

---

## Example

```
"I don't have enough time"
├── ASSUME RIGHT → You genuinely lack hours
│   ├── "The deadline is immovable"
│   │   ├── AR → "Something will not get done"
│   │   └── AW → "The deadline has flexibility"
│   └── "All current tasks are essential"
│       ├── AR → "More resources are required"
│       └── AW → "Some tasks are not actually essential"
│
└── ASSUME WRONG → Alternatives to "not enough time"
    ├── "Time is being spent on the wrong things"
    │   ├── AR → "Reallocation would solve the problem"
    │   └── AW → "Current allocation is optimal"
    └── "The approach is more complex than necessary"
        ├── AR → "A simpler approach exists"
        └── AW → "The complexity is inherent"
```

**Why claims and not actions?** — Actions can't be wrong. "Simplify the approach" isn't true or false - it's just something you could do. "A simpler approach exists" is a claim that could be wrong. Only claims can be examined.

**Why complete sentences?** — A fragment like "deadline" or "flexibility" can't be true or false. "The deadline is fixed" can be.

---

## How ARAW Differs From Other Approaches

| Approach | What It Does | How ARAW Differs |
|----------|--------------|------------------|
| **Chain-of-Thought** | Linear step-by-step reasoning | CoT follows ONE path. ARAW explores BOTH paths at each step |
| **Pro/Con Lists** | List advantages and disadvantages | Pro/con is static. ARAW is recursive - each pro/con is itself a claim to test |
| **Devil's Advocate** | Argue the opposing position | Devil's advocate is adversarial. ARAW explores with genuine curiosity |
| **Decision Trees** | Map branching choices | Decision trees map actions. ARAW maps beliefs |

### ARAW vs Chain-of-Thought

**Chain-of-Thought**: "Let me think step by step..."
- Step 1 → Step 2 → Step 3 → Conclusion
- Linear, forward-only
- Assumes each step is correct

**ARAW**: "Let me explore what's true and what might not be..."
```
Step 1
├── ASSUME RIGHT → Step 2a
│   └── ASSUME WRONG → What if 2a is wrong?
└── ASSUME WRONG → Step 2b (alternative to Step 1)
    └── ASSUME WRONG → What if 2b is also wrong?
```

Chain-of-Thought is like walking a path. ARAW is like mapping the territory.

---

## When do I stop exploring?

When you hit a foundation:
- Questioning becomes circular ("Why?" → "Because I want it")
- Something becomes obvious and can't be disagreed with
- No alternatives exist (CLOSED claim)

## What's the difference between OPEN and CLOSED claims?

**CLOSED**: No real alternatives exist - accept as foundation.

**OPEN**: Alternatives exist - explore them. Most "obvious facts" are actually OPEN.

## How do I find hidden assumptions?

Unbundle compound statements. "I need X" contains multiple claims that can be wrong independently.

## What does unbundling look like?

For "I need to quit my job", ARAW first converts this decision into claims that can be true or false:

| Claim (universalized) | Broader Question |
|-----------------------|------------------|
| A problem exists | Is there actually a problem? |
| The job is causing it | Is the job the source? |
| Quitting removes the cause | Will quitting fix it? |
| Alternatives do not exist | Are there other options? |
| What comes after is better | Is the after-state known and preferable? |

Then it ARAWs each claim.

---

## How deep should I go?

| Depth | Claims | Levels | When to Use |
|-------|--------|--------|-------------|
| **Lite** | 1 | 2 | Quick surface check |
| **1x** | 5 | 3 | Normal analysis |
| **2x** | 7 | 4 | Important decisions |
| **4x** | 12 | 6 | High-stakes decisions |
| **8x** | 18 | 8 | Novel/complex situations |

## What should I do before exploring?

Define success criteria - what must be true for this analysis to succeed.

## What should ASSUME RIGHT do?

Search for what becomes possible. Find what would make this easy.

## What's wrong with the obvious alternative?

It's usually just the opposite of what you said. Construct options that differ from ALL alternatives listed so far.

## Why am I getting vague answers?

Wrong question form. "What qualities?" → vague. "What must be true?" → checkable. "What would cause failure?" → actionable.

## What is quality?

Quality = f(thing, audience, context, purpose). Specify: FOR WHOM, in WHAT CONTEXT, for WHAT PURPOSE.

## How can usage of ARAW improve ARAW?

ARAW produces reusable artifacts naturally: verified claims, catalogued alternatives, named tensions. These accumulate into a searchable knowledge base. Future runs query past knowledge and start from better positions. The method produces its own improvement material as a byproduct of use.

---

## How do I use it?

### Manual

1. **State your claim clearly** - What are you assuming?
2. **ASSUME RIGHT**: What follows if true? What can you build?
3. **ASSUME WRONG**: What alternatives if false? What changes?
4. **Mark claims**: Is this OPEN (explore) or CLOSED (accept)?
5. **Recurse** on interesting branches
6. **Stop** when you hit foundations or analysis stops being useful

### With Claude Code

```
/araw [your claim]           # Base depth (1x)
/araw 2x [your claim]        # Double depth
/araw 4x [your claim]        # Deep analysis
/araw 8x [your claim]        # Maximum depth
```

See [SETUP.md](SETUP.md) for installation.

---

## Repository Structure

```
ARAW/
├── README.md              # You are here
├── SETUP.md               # Claude Code installation
├── LICENSE
│
├── skills/                # Claude Code skills
│   ├── araw/              # Main ARAW skill
│   └── adversarial_review/
│
├── methodology/           # The theory behind ARAW
│   ├── 01_core_principles.md
│   ├── 02_process.md
│   └── 03_capability_guidance.md
│
├── tensions/              # Fundamental trade-offs
│   ├── TOP_10.md          # Quick reference (start here)
│   └── full_library.md    # Complete 200+ tensions
│
└── examples/              # ARAW sessions
    ├── SHOWCASE.md        # Curated best examples
    └── [session files]
```

---

## Related

ARAW is the core exploration method of [GOSM (Goal-Oriented State Machine)](https://github.com/benjam3n/GOSM) - a system for processing goals, problems, questions, decisions, situations, and feelings.

---

## License

CC BY-NC 4.0 (Creative Commons Attribution-NonCommercial)

You can use, share, and adapt this work for non-commercial purposes with attribution. See [LICENSE](LICENSE) for details.

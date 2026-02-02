---
description: Execute the implementation planning workflow using the plan template to generate design artifacts.
handoffs:
  - label: Create Tasks
    agent: speckit.tasks
    prompt: Break the plan into tasks
    send: true
  - label: Create Checklist
    agent: speckit.checklist
    prompt: Create a checklist for the following domain...
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Setup**: Run `.specify/scripts/bash/setup-plan.sh --json` from repo root and parse JSON for FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Scope Validation**: Before loading context, verify spec has clear boundaries:
   - Check FEATURE_SPEC has explicit in-scope and out-of-scope sections
   - If scope boundaries are missing or ambiguous: ERROR - return user to `/speckit.clarify`
   - Extract acceptance criteria for later verification planning

3. **Load context** (parallel Read calls in a single message):
   - FEATURE_SPEC
   - `.specify/memory/constitution.md`
   - IMPL_PLAN template (already copied)

4. **Architectural Fit Analysis**: Before executing plan workflow:
   - Use Task tool with Explore agent to find existing patterns related to the feature
   - Document which existing patterns to follow vs. where new patterns are needed
   - This informs research decisions and prevents architectural drift

5. **Execute plan workflow**: Follow the structure in IMPL_PLAN template to:
   - Fill Technical Context (mark unknowns as "NEEDS CLARIFICATION")
   - Fill Constitution Check section from constitution
   - Evaluate gates using `mcp__sequential-thinking__sequentialthinking` for complex tradeoffs (ERROR if violations unjustified)
   - Phase 0: Generate research.md (resolve all NEEDS CLARIFICATION)
   - Phase 1: Generate data-model.md, contracts/, quickstart.md
   - Phase 1: Update agent context by running the agent script
   - Phase 2: Execute planning quality gates
   - Re-evaluate Constitution Check post-design

6. **Stop and report**: Command ends after Phase 2 planning. Report:
   - Branch and IMPL_PLAN path
   - Generated artifacts
   - Risk summary (count by severity)
   - Critical path length
   - MVP boundary (if applicable)

## Phases

### Phase 0: Outline & Research

1. **Validate scope boundaries** from spec.md:
   - Confirm in-scope items are clearly defined
   - Confirm out-of-scope items are explicitly listed
   - If missing: ERROR - return to /speckit.clarify

2. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

3. **Dispatch research using Task tool** (parallel calls in a single message when independent):

   ```text
   For codebase questions (existing patterns, implementations):
     Task(subagent_type="Explore", prompt="Find how {pattern} is implemented in this codebase...")

   For architectural fit (REQUIRED for each feature):
     Task(subagent_type="Explore", prompt="Find existing patterns for {similar functionality} in this codebase. Document: patterns used, files involved, conventions followed.")

   For library/framework documentation:
     Use Context7 MCP tools (resolve-library-id → query-docs) for up-to-date docs

   For external research (best practices, comparisons, industry patterns):
     Task(subagent_type="general-purpose", prompt="Research best practices for {tech} in {domain}...")
     → Agent should use WebSearch for current information
   ```

4. **Consolidate findings** in `research.md` using format:
   - **Architectural Fit**: Existing patterns to follow, new patterns needed
   - **Decision**: [what was chosen]
   - **Rationale**: [why chosen]
   - **Alternatives considered**: [what else evaluated]
   - **Dependencies**: Technical deps (libraries, APIs) + Task deps (what blocks what)
   - **Risk Register**: Identified risks with likelihood/impact/mitigation

**Output**: research.md with all NEEDS CLARIFICATION resolved, architectural fit documented, dependencies mapped, and risks identified

### Phase 1: Design & Contracts

**Prerequisites:** `research.md` complete

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate quickstart.md**:
   - Step-by-step implementation guide
   - Based on data-model.md entities and spec requirements
   - Each step should be atomic and verifiable
   - Use Explore subagents for parallel file reading when gathering implementation context

4. **Agent context update**:
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
   - These scripts detect which AI agent is in use
   - Update the appropriate agent-specific context file
   - Add only new technology from current plan
   - Preserve manual additions between markers

**Output**: data-model.md, /contracts/*, quickstart.md, agent-specific file

### Phase 2: Planning Quality Gates

**Prerequisites:** data-model.md, quickstart.md complete

1. **Critical Path Analysis**:
   - Identify longest dependency chain in quickstart steps
   - Flag any step that blocks 3+ downstream steps
   - Document in plan.md under "Critical Path" section

2. **Testing Strategy**:
   - For each entity in data-model.md: how to verify?
   - For each integration point: what test confirms it works?
   - Output: Add "Testing Approach" section to plan.md

3. **Incremental Delivery Assessment**:
   - Can feature deliver partial value early?
   - What's the minimum slice that provides user benefit?
   - Document MVP boundary if applicable

4. **Risk Review**:
   - Review Risk Register from research.md
   - Ensure each HIGH/CRITICAL risk has mitigation
   - If unmitigated CRITICAL risk: ERROR - cannot proceed

**Output**: Enhanced plan.md with Critical Path, Testing Approach, Delivery Strategy sections

## Key rules

- Use absolute paths
- ERROR on gate failures or unresolved clarifications
- Scope boundaries MUST be validated before research begins
- Risk Register MUST be generated in Phase 0
- Testing Strategy MUST be documented before stopping
- Critical path MUST be identified for features with 5+ quickstart steps

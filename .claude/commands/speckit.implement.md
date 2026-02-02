---
description: Execute the implementation plan by processing and executing all tasks defined in tasks.md
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

### Step 1: Prerequisites Check

Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

---

### Step 2: Check Checklists (if FEATURE_DIR/checklists/ exists)

**Delegate to Explore agent** for checklist scanning:

Launch an Explore agent with this prompt:
```
Scan all checklist files in {FEATURE_DIR}/checklists/. For each file:
- Count total items (lines matching `- [ ]` or `- [X]` or `- [x]`)
- Count completed items (lines matching `- [X]` or `- [x]`)
- Count incomplete items (lines matching `- [ ]`)

Return a JSON summary in this exact format:
{
  "checklists": [
    { "filename": "ux.md", "total": 12, "completed": 12, "incomplete": 0 },
    { "filename": "test.md", "total": 8, "completed": 5, "incomplete": 3 }
  ],
  "allComplete": false
}
```

**Process agent results**:
- Parse the JSON summary from the agent
- Create a status table from the condensed data:

  ```text
  | Checklist | Total | Completed | Incomplete | Status |
  |-----------|-------|-----------|------------|--------|
  | ux.md     | 12    | 12        | 0          | ✓ PASS |
  | test.md   | 8     | 5         | 3          | ✗ FAIL |
  ```

- **If any checklist is incomplete** (`allComplete: false`):
  - Display the table with incomplete item counts
  - **STOP** Use the AskUserQuestion tool and ask: "Some checklists are incomplete. Do you want to proceed with implementation anyway? (yes/no)"
  - Wait for user response before continuing
  - If user says "no" or "wait" or "stop", halt execution
  - If user says "yes" or "proceed" or "continue", proceed to step 3

- **If all checklists are complete** (`allComplete: true`):
  - Display the table showing all checklists passed
  - Automatically proceed to step 3

---

### Step 3: Load Implementation Context

**Delegate to Explore agent** for spec summarization:

Launch an Explore agent with this prompt:
```
Read and summarize the following files from {FEATURE_DIR}:

**REQUIRED FILES:**
- tasks.md: Extract ALL task phases, task IDs, descriptions, [P] parallel markers, and file paths
- plan.md: Extract tech stack, architecture decisions, file structure, critical constraints

**OPTIONAL FILES (if they exist):**
- data-model.md: Extract entities, relationships, and field definitions
- contracts/: Extract API specifications and test requirements
- research.md: Extract key technical decisions and constraints
- quickstart.md: Extract integration scenarios

Return a structured JSON summary:
{
  "techStack": {
    "language": "TypeScript",
    "framework": "Phaser 3",
    "buildTool": "Vite",
    "otherTech": ["arcade physics", "..."]
  },
  "architecture": {
    "patterns": ["Entity-Component", "Event-driven"],
    "fileStructure": { "src/entities": "game entities", "src/systems": "game systems" },
    "keyConstraints": ["No external dependencies", "Must use existing event system"]
  },
  "tasks": {
    "phases": ["Setup", "Tests", "Core", "Integration", "Polish"],
    "items": [
      {
        "id": "1.1",
        "phase": "Setup",
        "description": "Create health component",
        "files": ["src/components/Health.ts"],
        "isParallel": false,
        "dependsOn": []
      }
    ]
  },
  "dataModel": {
    "entities": [{ "name": "Enemy", "fields": ["health", "maxHealth"] }]
  },
  "contracts": {
    "apis": [],
    "testRequirements": []
  },
  "criticalConstraints": [
    "Must maintain 60 FPS",
    "No breaking changes to existing systems"
  ]
}
```

**Store the structured digest** for use in subsequent steps. Main agent now has condensed context, not full file contents.

---

### Step 4: Project Setup Verification

**Main agent handles directly** (minimal context, straightforward file operations):

- **REQUIRED**: Create/verify ignore files based on actual project setup:

**Detection & Creation Logic**:
- Check if the following command succeeds to determine if the repository is a git repo (create/verify .gitignore if so):

  ```sh
  git rev-parse --git-dir 2>/dev/null
  ```

- Check if Dockerfile* exists or Docker in plan.md → create/verify .dockerignore
- Check if .eslintrc* exists → create/verify .eslintignore
- Check if eslint.config.* exists → ensure the config's `ignores` entries cover required patterns
- Check if .prettierrc* exists → create/verify .prettierignore
- Check if .npmrc or package.json exists → create/verify .npmignore (if publishing)
- Check if terraform files (*.tf) exist → create/verify .terraformignore
- Check if .helmignore needed (helm charts present) → create/verify .helmignore

**If ignore file already exists**: Verify it contains essential patterns, append missing critical patterns only
**If ignore file missing**: Create with full pattern set for detected technology

**Common Patterns by Technology** (from techStack in digest):
- **Node.js/JavaScript/TypeScript**: `node_modules/`, `dist/`, `build/`, `*.log`, `.env*`
- **Python**: `__pycache__/`, `*.pyc`, `.venv/`, `venv/`, `dist/`, `*.egg-info/`
- **Java**: `target/`, `*.class`, `*.jar`, `.gradle/`, `build/`
- **C#/.NET**: `bin/`, `obj/`, `*.user`, `*.suo`, `packages/`
- **Go**: `*.exe`, `*.test`, `vendor/`, `*.out`
- **Ruby**: `.bundle/`, `log/`, `tmp/`, `*.gem`, `vendor/bundle/`
- **PHP**: `vendor/`, `*.log`, `*.cache`, `*.env`
- **Rust**: `target/`, `debug/`, `release/`, `*.rs.bk`, `*.rlib`, `*.prof*`, `.idea/`, `*.log`, `.env*`
- **Kotlin**: `build/`, `out/`, `.gradle/`, `.idea/`, `*.class`, `*.jar`, `*.iml`, `*.log`, `.env*`
- **C++**: `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.so`, `*.a`, `*.exe`, `*.dll`, `.idea/`, `*.log`, `.env*`
- **C**: `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.a`, `*.so`, `*.exe`, `Makefile`, `config.log`, `.idea/`, `*.log`, `.env*`
- **Swift**: `.build/`, `DerivedData/`, `*.swiftpm/`, `Packages/`
- **R**: `.Rproj.user/`, `.Rhistory`, `.RData`, `.Ruserdata`, `*.Rproj`, `packrat/`, `renv/`
- **Universal**: `.DS_Store`, `Thumbs.db`, `*.tmp`, `*.swp`, `.vscode/`, `.idea/`

**Tool-Specific Patterns**:
- **Docker**: `node_modules/`, `.git/`, `Dockerfile*`, `.dockerignore`, `*.log*`, `.env*`, `coverage/`
- **ESLint**: `node_modules/`, `dist/`, `build/`, `coverage/`, `*.min.js`
- **Prettier**: `node_modules/`, `dist/`, `build/`, `coverage/`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
- **Terraform**: `.terraform/`, `*.tfstate*`, `*.tfvars`, `.terraform.lock.hcl`
- **Kubernetes/k8s**: `*.secret.yaml`, `secrets/`, `.kube/`, `kubeconfig*`, `*.key`, `*.crt`

---

### Step 5: Parse Task Structure

**Delegate to Plan agent** for execution DAG:

Launch a Plan agent with this prompt:
```
Given this task summary from the spec digest:
{tasks_from_step_3}

Build an execution plan:
1. Identify task phases: Setup, Tests, Core, Integration, Polish
2. Parse dependencies: sequential vs parallel [P] tasks
3. Group tasks that can run concurrently (tasks marked [P] with no file conflicts)
4. Identify file conflicts (tasks touching same files must be sequential)
5. Determine TDD ordering (test tasks before their corresponding implementation)

Return an ordered execution plan:
{
  "executionGroups": [
    {
      "groupId": 1,
      "phase": "Setup",
      "canParallelize": false,
      "tasks": [
        { "id": "1.1", "description": "...", "files": [...], "isParallel": false }
      ],
      "blockedBy": []
    },
    {
      "groupId": 2,
      "phase": "Tests",
      "canParallelize": true,
      "tasks": [
        { "id": "2.1", "description": "...", "files": [...], "isParallel": true },
        { "id": "2.2", "description": "...", "files": [...], "isParallel": true }
      ],
      "blockedBy": [1]
    }
  ],
  "totalTasks": 15,
  "parallelizableTasks": 6,
  "estimatedGroups": 8
}
```

**Store the execution DAG** for Step 6.

---

### Step 6: Execute Implementation

Process each execution group from Step 5:

#### For groups with `canParallelize: true`:

**Spawn parallel code-architect agents** (single message with multiple Task tool calls):

For each [P] task in the group, launch a code-architect agent with:
```
Implement this task:

**Task ID**: {task.id}
**Description**: {task.description}
**Files to create/modify**: {task.files}

**Context**:
- Tech Stack: {techStack_from_digest}
- Architecture Patterns: {architecture.patterns}
- Critical Constraints: {criticalConstraints}

**Instructions**:
1. Follow TDD if this is a test task
2. Match existing code style and patterns
3. Use the project's existing utilities and abstractions
4. Implement ONLY what the task specifies - no extras

**Report completion**:
{
  "taskId": "{task.id}",
  "status": "completed" | "failed" | "blocked",
  "filesCreated": [...],
  "filesModified": [...],
  "error": null | "description of issue",
  "notes": "any important observations"
}
```

**Wait for all parallel agents to complete**, then:
- Collect results from all agents
- Handle any failures (log error, mark task as incomplete)
- Proceed to next group

#### For groups with `canParallelize: false`:

**Main agent implements sequentially**:
- Execute each task in order
- Use the condensed context from Step 3
- Follow existing code patterns

#### After each group completion:

**Launch code-reviewer agent** for validation:
```
Review the following recently implemented files:
{files_from_completed_group}

Check for:
1. Adherence to project conventions (from CLAUDE.md patterns)
2. Consistency with specification requirements
3. Potential bugs or logic errors
4. Security issues (if applicable)

Return:
{
  "passed": true | false,
  "issues": [
    { "file": "...", "line": N, "severity": "error|warning", "message": "..." }
  ],
  "suggestions": [...]
}
```

If critical issues found, address them before proceeding.

---

### Step 7: Progress Tracking

After completing each task:
- Report progress to user
- **Mark completed tasks** as `[X]` in tasks.md
- Use Bash agent to update task markers:

```
Update tasks.md: Change "- [ ] {task.id}" to "- [X] {task.id}" for completed task
```

**Error handling**:
- Halt execution if any non-parallel task fails
- For parallel tasks [P], continue with successful tasks, report failed ones
- Provide clear error messages with context for debugging
- Suggest next steps if implementation cannot proceed

---

### Step 8: Final Validation

**Launch code-reviewer agent** for comprehensive validation:
```
Perform final implementation validation:

**Implemented files**: {all_files_created_or_modified}
**Original spec summary**: {digest_from_step_3}

Verify:
1. All required tasks from tasks.md are completed
2. Implemented features match the specification
3. Test coverage meets requirements (if tests exist)
4. Implementation follows the technical plan architecture
5. No breaking changes to existing functionality

Return:
{
  "validationPassed": true | false,
  "completedTasks": N,
  "totalTasks": M,
  "coverage": { "tested": X, "untested": Y },
  "issues": [...],
  "summary": "Implementation complete with X features, Y tests passing"
}
```

---

### Step 9: Completion Report

Present final status summary:
- Total tasks completed vs total tasks
- Files created/modified
- Any outstanding issues or warnings
- Suggestions for next steps (if any tasks incomplete)

---

## Subagent Reference

| Phase | Agent Type | Purpose | Context Passed |
|-------|------------|---------|----------------|
| Step 2 | Explore | Checklist scanning | FEATURE_DIR path only |
| Step 3 | Explore | Spec summarization | FEATURE_DIR, file list |
| Step 5 | Plan | Execution DAG | Task list from digest |
| Step 6 | code-architect (parallel) | Task implementation | Single task + condensed context |
| Step 6 | code-reviewer | Group validation | Implemented files |
| Step 8 | code-reviewer | Final validation | All files + spec summary |

**Context savings**: Main conversation receives structured digests instead of full file contents, enabling efficient orchestration while subagents handle detailed work.

---

## Notes

- This command assumes a complete task breakdown exists in tasks.md
- If tasks are incomplete or missing, suggest running `/speckit.tasks` first
- Parallel execution requires tasks marked with [P] and no file conflicts
- Each subagent receives focused context for its specific task

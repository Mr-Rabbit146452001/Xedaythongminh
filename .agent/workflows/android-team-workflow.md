# Workflow: Multi-Agent Android Development SOP

This Standard Operating Procedure (SOP) coordinates the 4 specialized agents sequentially to build high-quality Android features with zero regressions.

---

## Phase 1: Architecture & Planning
- **Agent Assigned**: `android-architect`
- **Actions**:
  1. Analyze feature requirements.
  2. Map out the 3 layers: Presentation (`UiState`, `UiEvent`), Domain (`UseCase`), Data (`Repository`).
  3. Generate the Architecture Spec Document and file tree plan.
- **Exit Gate**: The user reviews and approves the Architecture Spec.

---

## Phase 2: Implementation
- **Agent Assigned**: `android-developer`
- **Actions**:
  1. Consume the Architecture Spec from Phase 1.
  2. Implement Domain UseCases and Data Repositories.
  3. Implement ViewModel with immutable `StateFlow`.
  4. Implement Compose UI screens with Material 3.
- **Exit Gate**: Code compiles without syntax errors.

---

## Phase 3: Code Review Gate
- **Agent Assigned**: `code-reviewer`
- **Actions**:
  1. Inspect the code generated in Phase 2 against Clean Architecture and MAD checklists.
  2. Check for coroutine scope leaks, memory leaks, and Compose recomposition traps.
- **Exit Gate**:
  - If **REJECTED**: Send feedback to `android-developer` to refactor.
  - If **APPROVED**: Advance directly to Phase 4.

---

## Phase 4: Quality Assurance (QA)
- **Agent Assigned**: `qa-tester`
- **Actions**:
  1. Write Unit Tests for ViewModel and UseCases with MockK and Turbine.
  2. Test loading, success, and error branches.
  3. Validate full integration of the feature.
- **Exit Gate**: All tests are written and ready to run.

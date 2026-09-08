---
name: android-guidelines
description: Apply Modern Android Development (MAD) standards, Clean Architecture, Jetpack Compose, Material 3, Coroutines, StateFlow, and Hilt when writing, reviewing, or refactoring Android code.
---

# Modern Android Development & Clean Architecture Guidelines

This skill guides the AI Agent to design, implement, and refactor Android applications adhering strictly to Google's official Modern Android Development (MAD) best practices.

## 1. Architectural Blueprint (Clean Architecture)

Organize code strictly into 3 decoupled layers:

### A. Presentation Layer (UI & State)
- **UI Framework**: 100% Jetpack Compose. Absolutely NO legacy XML layouts unless explicitly requested.
- **Design System**: Material 3 (`androidx.compose.material3`). Support dynamic theming, dark mode, and Edge-to-Edge display (`enableEdgeToEdge()`).
- **Pattern**: Unidirectional Data Flow (UDF) with MVI / MVVM.
- **State Management**:
  - Expose UI state as a single immutable `StateFlow<UiState>` from `ViewModel`.
  - Never mutate state directly in Composables.
  - Represent UI State with Kotlin data classes:
    ```kotlin
    data class ScreenUiState(
        val isLoading: Boolean = false,
        val items: List<Item> = emptyList(),
        val userMessage: String? = null
    )
    ```
  - Collect state in Composables using `collectAsStateWithLifecycle()`.

### B. Domain Layer (Business Logic)
- Keep independent of Android Framework classes (pure Kotlin).
- **Use Cases**: Single responsibility per Use Case (e.g., `GetUserProfileUseCase`).
- Execute via `operator fun invoke()` returning `Flow<Result<T>>` or suspending functions.

### C. Data Layer (Data & Integrations)
- **Repositories**: Single Source of Truth (SSOT). Coordinates between local cache and remote API.
- **Local Storage**: Room Database with Coroutine/Flow support, DataStore for preferences (no `SharedPreferences`).
- **Networking**: Retrofit with Kotlinx.serialization or Ktor Client.
- **Data Mapping**: Always map network/database DTOs into Domain Entities before passing to Domain/UI.

---

## 2. Concurrency & Asynchronous Programming

- **Coroutines & Flow**: Exclusively use Kotlin Coroutines for async tasks and `Flow` for reactive streams.
- **Dispatchers**: Never hardcode dispatchers. Inject `CoroutineDispatcher` (default to `Dispatchers.IO` for disk/network, `Dispatchers.Default` for CPU-heavy tasks).
- **Lifecycle Safety**: Use `viewModelScope` in ViewModels. Cancel tasks properly when lifecycle ends.

---

## 3. Dependency Injection (DI)

- Use **Hilt** (`@HiltAndroidApp`, `@AndroidEntryPoint`, `@HiltViewModel`, `@Inject`).
- Provide dependencies via `@Module` and `@InstallIn(SingletonComponent::class)`.
- Alternative lightweight option: **Koin** (only if project specifically specifies).

---

## 4. Code Quality & Performance

- **Compose Stability**: Keep composable parameters immutable or mark data classes with `@Immutable` / `@Stable` to prevent unnecessary recompositions.
- **Modularity**: Split large features into Gradle feature modules (`:core:designsystem`, `:core:data`, `:feature:login`, etc.).
- **Unit & UI Testing**:
  - Unit tests: JUnit 5/4, MockK / Turbine (for testing Flows).
  - Compose tests: `createComposeRule()` or `createAndroidComposeRule()`.
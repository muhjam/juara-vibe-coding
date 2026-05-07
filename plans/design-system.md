# Design & UI Plan

## Visual Style
- **Aesthetic**: Premium, minimal, and high-contrast.
- **Typography**: Inter (from Untitled UI).
- **Colors**: 
  - Primary: Slate/Zinc for a modern professional look.
  - Success: Emerald for correct answers.
  - Error: Rose for incorrect answers.
  - Warning: Amber for pending tasks.

## Page Designs

### 1. Landing Page
- Large Hero section with a clear "Start Test" call to action.
- Multi-step form or a clean single-page form using Untitled UI `Input`, `Select`, and `Slider` components.
- Progress visualization for the test setup.

### 2. Playground (The Core Experience)
- **Reading**: 
  - Left panel: Text passage with high readability.
  - Right panel: Multiple choice questions.
- **Writing**:
  - Sentence with `[___]` blanks.
  - Inline text input for filling the blanks.
- **Speaking**:
  - Large Mic button with a waveform animation (simulated or real).
  - "Open Mic" feel with status indicators (Listening, Processing).
- **Listening**:
  - Custom audio player with playback speed control.
  - Multiple choice questions below the player.

### 3. Result Page
- Circular progress bar for the overall score.
- Breakdown by Skill (Reading, Writing, etc.).
- "Review Answers" section to see what went wrong.

## Component Reuse (Untitled UI)
We will utilize the following from `@template-untitled-ui`:
- `Button`: For all interactions.
- `Card`: To wrap questions.
- `Badge`: For skill tags.
- `Progress`: For test progress bar.
- `Alert`: For feedback messages.
- `Modal`: For confirmation (e.g., "Are you sure you want to exit?").

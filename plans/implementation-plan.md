# Implementation Plan - Language Learning App

## Phase 1: Environment & Scaffolding
- [ ] Initialize Next.js project (if not already done).
- [ ] Setup `tailwind.config.ts` and `index.css` with Untitled UI design tokens.
- [ ] Copy core components from `@template-untitled-ui` to `/src/components/base`.
- [ ] Setup environment variables for AI providers.

## Phase 2: Landing Page
- [ ] Build the landing page with the configuration form.
- [ ] Implement `localStorage` logic to save the test configuration.
- [ ] Add animations for the "Start Test" transition.

## Phase 3: AI Integration & API
- [ ] Create `/api/generate-question` route.
- [ ] Implement AI provider abstraction (`lib/ai/providers`).
- [ ] Add support for Gemini, Groq, and OpenAI.

## Phase 4: Playground (Modular Skills)
- [ ] Build `PlaygroundView` container with a progress bar.
- [ ] Implement `ReadingTask` (MCQ).
- [ ] Implement `WritingTask` (Fill in the blanks).
- [ ] Implement `ListeningTask` (Audio player + MCQ).
- [ ] Implement `SpeakingTask` (Mic interaction).
- [ ] Add "Next Question" logic with chunked AI calls.

## Phase 5: Results & Polish
- [ ] Build `ResultView` with score calculation.
- [ ] Implement "Review" mode.
- [ ] Add premium polish: transitions, hover effects, and responsive design.
- [ ] Final testing and linting checks.

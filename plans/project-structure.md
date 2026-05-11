# Project Structure Plan

## Overview
The application is a Language Learning Test platform built with Next.js (App Router), focusing on modularity, AI integration, and local state management.

## Directory Structure
Follows the kebab-case folder and `index.tsx` convention.

```text
/src
  /app
    /layout.tsx
    /page.tsx (Landing Page)
    /playground
      /index.tsx
    /result
      /index.tsx
  /components
    /base (Shared UI from Untitled UI)
      /button/index.tsx
      /input/index.tsx
      /card/index.tsx
      ...
    /features
      /landing-form
        /index.tsx
      /playground-view
        /index.tsx
        /reading-task/index.tsx
        /writing-task/index.tsx
        /speaking-task/index.tsx
        /listening-task/index.tsx
      /result-view
        /index.tsx
  /lib
    /ai
      /providers (Groq, Gemini, OpenAI, Claude)
        /index.ts
      /index.ts (AI Service orchestrator)
    /storage
      /index.ts (LocalStorage wrappers)
  /hooks
    /use-quiz/index.ts
    /use-audio-recorder/index.ts
  /types
    /index.ts
```

## Modularization Strategy
1.  **Component Level**: Every major feature (Landing, Playground, Result) is a separate module in `/features`.
2.  **Logic Level**: AI provider logic is abstracted so adding a new provider only requires adding a new strategy class/function in `/lib/ai/providers`.
3.  **State Level**: Use `localStorage` for persistence. All session logic is encapsulated in `useQuiz` hook.

## Environment Variables (.env)
We will use a centralized configuration in `.env` to manage AI providers securely.

```bash
# Provider selection: gemini | groq | openai | anthropic
AI_PROVIDER=gemini
AI_MODEL_NAME=gemini-3-flash-preview

# API Keys
GROQ_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

## AI Integration & Parsing Logic
Since the AI will return a custom CSV format (`description |-> options |-> answer |-> skill |-> type <_>`), the implementation will include:

1.  **AI Provider Wrapper**: A central service that reads `AI_PROVIDER` and calls the respective SDK.
2.  **Custom Parser**: A utility function to split the response string by `<_>` (for multiple questions) and then by `|->` for fields.
3.  **Sanitization**: Logic to handle the `['A', 'B', 'C', 'D']` string format and convert it into a proper JavaScript array.

## Question Chunking Logic
- Instead of requesting all questions at once, the frontend will loop through the number of questions.
- Each request will be: `POST /api/generate-question` with `{ index: 1, skill: 'Reading', type: 'Multiple Choice', language: 'English' }`.
- This ensures reliability and allows for progress indicators.

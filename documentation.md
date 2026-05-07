# AI Lingua - Documentation for #JuaraVibeCoding

## 🚀 Project Overview
**AI Lingua** is a next-generation language proficiency platform that leverages advanced AI to generate unique, personalized, and immersive language tests. Unlike traditional platforms that rely on static question banks, AI Lingua ensures that every test session is completely original, tailored to the user's selected language and skill level.

---

## 🎯 1. Problem (30%) - The "Why"

### Target Audience
*   **Self-Learners**: Individuals looking to master global languages (English, Japanese, French, etc.) or regional languages (Javanese, Sundanese) through active practice.
*   **Test Preparers**: Students needing fresh practice material for exams without encountering the same questions repeatedly.
*   **Cultural Enthusiasts**: People interested in learning local Indonesian dialects where high-quality digital learning resources are often scarce.

### The Problem
Traditional language learning apps often suffer from:
1.  **Repetitive Content**: Question banks are limited, leading to memorization rather than actual learning.
2.  **Lack of Specificity**: General tests don't address specific skill gaps (e.g., someone might be good at reading but struggles with speaking fluency).
3.  **Limited Regional Support**: Most global platforms ignore regional languages like Javanese or Sundanese, leaving a gap in local digital education.

### Impact
AI Lingua democratizes language testing by providing an infinite source of high-quality, skill-centric assessment. It scales cultural preservation by making regional languages first-class citizens in an AI-driven educational ecosystem.

---

## 🛠️ 2. Solution (40%) - The "How"

### User Experience (UX)
*   **Premium Design**: A modern, glassmorphic UI with a focus on focus and readability.
*   **Seamless Interaction**: From configuration to the "Playground" and finally to detailed Results, the flow is intuitive and professional.
*   **Adaptive Audio**: Real-time voice synthesis that switches between "Man", "Woman", and "Narrator" roles to simulate real-world conversations.

### Value Proposition
*   **Infinite Freshness**: Every single question is generated on-the-fly by AI, ensuring no two tests are ever the same.
*   **Automated Grading**: Uses character-similarity algorithms (90% threshold) to grade Speaking and Writing skills objectively without manual intervention.
*   **Skill-Centric Playground**: Each skill (Reading, Writing, Speaking, Listening) has its own optimized playground mode (e.g., live transcription for speaking, interactive blanks for writing).

---

## ✨ 3. Uniqueness (30%) - The "Wow Factor"

### Originality
AI Lingua moves away from the rigid "Multiple Choice vs Essay" model. Instead, it uses **Skill-Driven Architecture**. The AI understands the context of the skill and dynamically generates the UI—providing options for Reading, but switching to a Live Microphone for Speaking.

### Technical Elegance (The AI "Wow")
*   **Prompt Engineering**: A sophisticated 4-column CSV parsing system allows for structured data extraction from raw AI responses, ensuring 100% compatibility with the UI.
*   **Multi-Voice Logic**: Custom logic to differentiate browser voices (Neural/Natural vs Standard) to create a "Narrator" (Robotic) vs "Character" (Human-like) auditory experience.
*   **Regional AI Support**: Deep integration with AI models that are fine-tuned to understand and generate content in **Javanese (su-ID)** and **Sundanese (jv-ID)**, making AI Lingua a leader in local-first educational tech.

---

## 🏗️ Technical Stack
*   **Frontend**: Next.js (App Router), TailwindCSS, TypeScript.
*   **AI Engine**: Gemini Pro & Groq (for ultra-fast response times).
*   **Deployment**: Fully containerized and deployed on **Google Cloud Run**.
*   **Speech**: Web Speech API with custom multi-voice parsing logic.

---

## 📈 Future Roadmap
*   **Gamification**: Leaderboards and streak systems.
*   **PDF Exports**: Automated certificate and performance report generation.
*   **Mobile App**: Native mobile experience using Capacitor or React Native.

---
**Created with ❤️ for #JuaraVibeCoding**

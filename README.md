# AI Lingua - Master Any Language with AI

AI Lingua is a modern, AI-powered language assessment platform built with Next.js and Gemini AI. It allows users to generate personalized, always-unique exams in 14+ languages across multiple skills including Reading, Writing, Speaking, and Listening, ensuring you never practice with the same questions twice.

![AI Lingua Banner](https://images.unsplash.com/photo-1451187530220-4e2a143521a3?auto=format&fit=crop&q=80&w=2070)

## 🚀 Features

- **AI-Powered Generation**: Instantly create unique exams tailored to your level and target language using Google Gemini.
- **Multilingual Support**: Learn English, Japanese, Korean, French, Spanish, Mandarin, Arabic, German, Italian, Portuguese, Russian, Hindi, Sundanese, or Javanese.
- **Skill-Based Testing**:
  - **Reading**: Comprehension questions based on AI-generated texts.
  - **Writing**: Sentence completion and translation with character-similarity scoring.
  - **Speaking**: Real-time voice recognition with live transcription feedback.
  - **Listening**: Immersive audio dialogues with multiple distinct voices (Narrator vs Characters).
- **#JuaraVibeCoding Submission**: Built specifically for the Google Cloud & AI Jam. [Read the full documentation here](./documentation.md).
- **Smart Evaluation**: Automated scoring and feedback using similarity algorithms to help you improve faster.
- **Beautiful UI**: Built with the premium **Untitled UI** design system for a sleek, modern, and accessible experience.
- **Dark Mode**: Fully supports light and dark themes.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **UI System**: [Untitled UI React](https://www.untitledui.com/react)
- **Styling**: Tailwind CSS v4
- **AI Engine**: Google Gemini API
- **State Management**: Zustand
- **Icons**: Untitled UI Icons
- **Voice**: Web Speech API

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ 
- Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/muhjam/lingua-ai.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 License

This project is licensed under the MIT License.

---

Developed with ❤️ by [Jamjam](https://github.com/muhjam) using **Antigravity AI**.

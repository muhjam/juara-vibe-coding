import { NextRequest, NextResponse } from "next/server";
import { GROQ_API_KEY } from "@/config";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const language = formData.get("language") as string;
        
        if (!file) {
            return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
        }

        if (!GROQ_API_KEY) {
            return NextResponse.json({ error: "GROQ_API_KEY is not set" }, { status: 500 });
        }

        // Prepare form data for Groq
        const groqFormData = new FormData();
        groqFormData.append("file", file);
        groqFormData.append("model", "whisper-large-v3");
        if (language) {
            // Map common language names to ISO codes if needed
            const langMap: Record<string, string> = {
                "English": "en",
                "Japanese": "ja",
                "Korean": "ko",
                "French": "fr",
                "Spanish": "es",
                "Mandarin": "zh",
                "German": "de",
                "Italian": "it",
                "Portuguese": "pt",
                "Russian": "ru",
            };
            const langCode = langMap[language] || "en";
            groqFormData.append("language", langCode);
        }

        const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
            },
            body: groqFormData,
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Groq Transcription Error:", data);
            return NextResponse.json({ error: data.error?.message || "Transcription failed" }, { status: response.status });
        }

        return NextResponse.json({ text: data.text });
    } catch (error: any) {
        console.error("Transcription API Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

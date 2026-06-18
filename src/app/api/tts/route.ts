import { NextRequest, NextResponse } from "next/server";
import textToSpeech from "@google-cloud/text-to-speech";

// Ambil kredensial dari environment variable secara terpisah
const getGoogleCredentials = () => {
    const projectId = process.env.GOOGLE_PROJECT_ID;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
        return {
            projectId,
            credentials: {
                client_email: clientEmail,
                private_key: privateKey.replace(/\\n/g, "\n"),
            },
        };
    }
    
    const jsonStr = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (jsonStr) {
        try {
            const credentials = JSON.parse(jsonStr);
            return {
                projectId: credentials.project_id,
                credentials: {
                    client_email: credentials.client_email,
                    private_key: credentials.private_key,
                },
            };
        } catch (e) {
            console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:", e);
        }
    }
    return null;
};

const config = getGoogleCredentials();
const client = new textToSpeech.TextToSpeechClient(
    config ? { projectId: config.projectId, credentials: config.credentials } : {}
);

/**
 * Hardcoded Voice Configuration for all supported languages.
 * Mapping: Language Code/Name -> BCP-47 Code & Voice Names
 * 
 * Karakter Suara:
 * - Male: Suara pria yang berat/berwibawa
 * - Female: Suara wanita yang ramah/natural
 * - Narrator: Suara yang lebih netral & jelas
 */
const VOICE_CONFIG: Record<string, { 
    code: string; 
    male: string; 
    female: string; 
    narrator: string;
}> = {
    // English
    "en": { code: "en-US", male: "en-US-Neural2-D", female: "en-US-Neural2-F", narrator: "en-US-Wavenet-G" },
    "English": { code: "en-US", male: "en-US-Neural2-D", female: "en-US-Neural2-F", narrator: "en-US-Wavenet-G" },
    
    // Japanese
    "ja": { code: "ja-JP", male: "ja-JP-Neural2-C", female: "ja-JP-Neural2-B", narrator: "ja-JP-Wavenet-A" },
    "Japanese": { code: "ja-JP", male: "ja-JP-Neural2-C", female: "ja-JP-Neural2-B", narrator: "ja-JP-Wavenet-A" },
    
    // Korean
    "ko": { code: "ko-KR", male: "ko-KR-Wavenet-C", female: "ko-KR-Wavenet-A", narrator: "ko-KR-Standard-A" },
    "Korean": { code: "ko-KR", male: "ko-KR-Wavenet-C", female: "ko-KR-Wavenet-A", narrator: "ko-KR-Standard-A" },
    
    // French
    "fr": { code: "fr-FR", male: "fr-FR-Neural2-B", female: "fr-FR-Neural2-A", narrator: "fr-FR-Wavenet-C" },
    "French": { code: "fr-FR", male: "fr-FR-Neural2-B", female: "fr-FR-Neural2-A", narrator: "fr-FR-Wavenet-C" },
    
    // Spanish
    "es": { code: "es-ES", male: "es-ES-Neural2-B", female: "es-ES-Neural2-A", narrator: "es-ES-Wavenet-C" },
    "Spanish": { code: "es-ES", male: "es-ES-Neural2-B", female: "es-ES-Neural2-A", narrator: "es-ES-Wavenet-C" },
    
    // Mandarin
    "zh-CN": { code: "cmn-CN", male: "cmn-CN-Wavenet-B", female: "cmn-CN-Wavenet-A", narrator: "cmn-CN-Standard-B" },
    "Mandarin": { code: "cmn-CN", male: "cmn-CN-Wavenet-B", female: "cmn-CN-Wavenet-A", narrator: "cmn-CN-Standard-B" },
    
    // Arabic
    "ar": { code: "ar-XA", male: "ar-XA-Wavenet-B", female: "ar-XA-Wavenet-A", narrator: "ar-XA-Wavenet-C" },
    "Arabic": { code: "ar-XA", male: "ar-XA-Wavenet-B", female: "ar-XA-Wavenet-A", narrator: "ar-XA-Wavenet-C" },
    
    // German
    "de": { code: "de-DE", male: "de-DE-Neural2-B", female: "de-DE-Neural2-F", narrator: "de-DE-Wavenet-C" },
    "German": { code: "de-DE", male: "de-DE-Neural2-B", female: "de-DE-Neural2-F", narrator: "de-DE-Wavenet-C" },
    
    // Italian
    "it": { code: "it-IT", male: "it-IT-Neural2-C", female: "it-IT-Neural2-A", narrator: "it-IT-Wavenet-B" },
    "Italian": { code: "it-IT", male: "it-IT-Neural2-C", female: "it-IT-Neural2-A", narrator: "it-IT-Wavenet-B" },
    
    // Portuguese
    "pt": { code: "pt-BR", male: "pt-BR-Neural2-B", female: "pt-BR-Neural2-A", narrator: "pt-BR-Wavenet-C" },
    "Portuguese": { code: "pt-BR", male: "pt-BR-Neural2-B", female: "pt-BR-Neural2-A", narrator: "pt-BR-Wavenet-C" },
    
    // Russian
    "ru": { code: "ru-RU", male: "ru-RU-Wavenet-B", female: "ru-RU-Wavenet-A", narrator: "ru-RU-Wavenet-C" },
    "Russian": { code: "ru-RU", male: "ru-RU-Wavenet-B", female: "ru-RU-Wavenet-A", narrator: "ru-RU-Wavenet-C" },
    
    // Hindi
    "hi": { code: "hi-IN", male: "hi-IN-Wavenet-B", female: "hi-IN-Wavenet-A", narrator: "hi-IN-Wavenet-C" },
    "Hindi": { code: "hi-IN", male: "hi-IN-Wavenet-B", female: "hi-IN-Wavenet-A", narrator: "hi-IN-Wavenet-C" },
    
    // Sundanese
    "su": { code: "id-ID", male: "id-ID-Wavenet-B", female: "id-ID-Wavenet-A", narrator: "id-ID-Wavenet-C" },
    "Sundanese": { code: "id-ID", male: "id-ID-Wavenet-B", female: "id-ID-Wavenet-A", narrator: "id-ID-Wavenet-C" },
    
    // Javanese (jw/jv)
    "jw": { code: "id-ID", male: "id-ID-Wavenet-B", female: "id-ID-Wavenet-A", narrator: "id-ID-Wavenet-C" },
    "jv": { code: "id-ID", male: "id-ID-Wavenet-B", female: "id-ID-Wavenet-A", narrator: "id-ID-Wavenet-C" },
    "Javanese": { code: "id-ID", male: "id-ID-Wavenet-B", female: "id-ID-Wavenet-A", narrator: "id-ID-Wavenet-C" },
    
    // Indonesian
    "id": { code: "id-ID", male: "id-ID-Wavenet-B", female: "id-ID-Wavenet-A", narrator: "id-ID-Wavenet-C" },
    "Indonesian": { code: "id-ID", male: "id-ID-Wavenet-B", female: "id-ID-Wavenet-A", narrator: "id-ID-Wavenet-C" },
};

const getVoiceParams = (lang: string, speaker: "male" | "female" | "narrator") => {
    const config = VOICE_CONFIG[lang] || VOICE_CONFIG["en"];
    
    return {
        languageCode: config.code,
        name: config[speaker]
    };
};

async function generateTTS(text: string, lang: string, speaker: "male" | "female" | "narrator") {
    const voiceParams = getVoiceParams(lang, speaker);

    try {
        const [response] = await client.synthesizeSpeech({
            input: { text },
            voice: voiceParams,
            audioConfig: { audioEncoding: "MP3" },
        });

        if (response.audioContent) {
            const audioBuffer = Buffer.from(response.audioContent as Uint8Array);
            return new NextResponse(audioBuffer, {
                headers: {
                    "Content-Type": "audio/mpeg",
                    "Content-Length": audioBuffer.length.toString(),
                },
            });
        }
    } catch (error) {
        console.error("Google Cloud TTS Error:", error);
    }

    // Fallback ke Google Translate TTS (Gratis)
    try {
        const langCode = VOICE_CONFIG[lang]?.code.split('-')[0] || "en";
        const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${langCode}&client=tw-ob`;
        const res = await fetch(googleUrl);
        const buffer = await res.arrayBuffer();
        return new NextResponse(buffer, { headers: { "Content-Type": "audio/mpeg" } });
    } catch (e) {
        return null;
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get("text");
    const lang = searchParams.get("lang") || "en";
    const speaker = (searchParams.get("speaker") || "narrator") as "male" | "female" | "narrator";

    if (!text) return NextResponse.json({ error: "Text is required" }, { status: 400 });

    const response = await generateTTS(text, lang, speaker);
    if (response) return response;
    
    return NextResponse.json({ error: "Failed to generate speech" }, { status: 500 });
}

export async function POST(req: NextRequest) {
    try {
        const { text, lang, speaker } = await req.json();
        if (!text) return NextResponse.json({ error: "Text is required" }, { status: 400 });

        const response = await generateTTS(text, lang || "en", speaker || "narrator");
        if (response) return response;

        return NextResponse.json({ error: "Failed to generate speech" }, { status: 500 });
    } catch (error) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}

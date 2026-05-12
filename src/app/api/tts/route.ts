import { NextRequest, NextResponse } from "next/server";

const MALE_VOICE_MAP: Record<string, string> = {
    "en": "en-US-ChristopherNeural",
    "id": "id-ID-ArdiNeural",
    "ja": "ja-JP-KeitaNeural",
    "ko": "ko-KR-InJoonNeural",
    "zh-CN": "zh-CN-YunxiNeural",
    "fr": "fr-FR-HenriNeural",
    "es": "es-ES-AlvaroNeural",
    "de": "de-DE-ConradNeural",
    "ar": "ar-SA-HamedNeural",
    "ru": "ru-RU-DmitryNeural",
    "hi": "hi-IN-MadhurNeural",
};

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get("text");
    const lang = searchParams.get("lang") || "en";
    const speaker = searchParams.get("speaker") || "female";

    console.log(`\n--- [TTS Proxy] MEMPROSES TEKS (${speaker.toUpperCase()}) ---`);
    console.log(`"${text}"`);
    console.log(`Lang: ${lang}`);

    if (!text) return NextResponse.json({ error: "Text is required" }, { status: 400 });

    let audioBuffer: ArrayBuffer | null = null;

    // 1. TRY NEURAL VOICE (For Male) - Menggunakan endpoint ReadAloud yang lebih stabil
    if (speaker === "male" && MALE_VOICE_MAP[lang]) {
        try {
            const voiceName = MALE_VOICE_MAP[lang];
            // Menggunakan endpoint Microsoft ReadAloud yang lebih robust
            const url = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/single-execution/content?action=synthesize&provider=main&voiceName=${voiceName}&text=${encodeURIComponent(text)}&outputFormat=audio-24khz-48kbitrate-mono-mp3`;
            
            const res = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
                    "Trusted-Client-Token": "6A5AA1D4EA75481FAD6597F683472946"
                }
            });
            
            if (res.ok) {
                console.log(`[TTS Proxy] Berhasil mendapatkan suara Pria Neural (${voiceName})`);
                audioBuffer = await res.arrayBuffer();
            } else {
                console.warn(`[TTS Proxy] Neural Pria Gagal (${res.status}). Menggunakan Fallback.`);
            }
        } catch (e) {
            console.error("[TTS Proxy] Error Pria Neural:", e);
        }
    }

    // 2. FALLBACK TO GOOGLE TTS
    if (!audioBuffer) {
        try {
            // Jika untuk pria tapi mesin neural gagal, kita coba gunakan kode bahasa yang seringkali pria di Google
            const targetLang = (speaker === "male" && lang === "en") ? "en-gb" : lang; 
            const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${targetLang}&client=tw-ob`;
            
            const res = await fetch(googleUrl, {
                headers: { "User-Agent": "Mozilla/5.0" }
            });
            if (res.ok) {
                console.log(`[TTS Proxy] Menggunakan Google TTS (${targetLang})`);
                audioBuffer = await res.arrayBuffer();
            }
        } catch (e) {
            console.error("[TTS Proxy] Error Google TTS:", e);
        }
    }

    if (!audioBuffer) return NextResponse.json({ error: "Failed to generate audio" }, { status: 500 });

    return new NextResponse(audioBuffer, {
        headers: {
            "Content-Type": "audio/mpeg",
            "Content-Length": audioBuffer.byteLength.toString(),
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=3600",
        },
    });
}

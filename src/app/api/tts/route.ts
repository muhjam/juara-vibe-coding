import { NextRequest, NextResponse } from "next/server";

// Koleksi Suara Utama (Fokus pada Karakter Suara)
const VOICE_MAP: Record<string, { male: string; female: string; narrator: string }> = {
    "en": { male: "en-US-AndrewNeural", female: "en-US-JennyNeural", narrator: "en-US-AriaNeural" },
    "ja": { male: "ja-JP-KeitaNeural", female: "ja-JP-NanamiNeural", narrator: "ja-JP-AoiNeural" },
    "id": { male: "id-ID-ArdiNeural", female: "id-ID-GadisNeural", narrator: "id-ID-SitiNeural" },
    "ko": { male: "ko-KR-InJoonNeural", female: "ko-KR-SunHiNeural", narrator: "ko-KR-BongJinNeural" },
};

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get("text");
    const lang = searchParams.get("lang") || "en";
    const speaker = (searchParams.get("speaker") || "narrator") as "male" | "female" | "narrator";

    if (!text) return NextResponse.json({ error: "Text is required" }, { status: 400 });

    const langData = VOICE_MAP[lang] || VOICE_MAP["en"];
    let voiceName = langData.narrator;
    if (speaker === "male") voiceName = langData.male;
    else if (speaker === "female") voiceName = langData.female;

    try {
        // Gunakan Raw Text (Lebih stabil untuk di-pitch shift oleh browser)
        const url = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/single-execution/content?action=synthesize&provider=main&voiceName=${voiceName}&text=${encodeURIComponent(text)}&outputFormat=audio-24khz-48kbitrate-mono-mp3`;
        
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
                "Trusted-Client-Token": "6A5AA1D4EA75481FAD6597F683472946"
            }
        });
        
        if (res.ok) {
            const audioBuffer = await res.arrayBuffer();
            return new NextResponse(audioBuffer, {
                headers: {
                    "Content-Type": "audio/mpeg",
                    "Content-Length": audioBuffer.byteLength.toString(),
                    "Accept-Ranges": "bytes",
                    "Cache-Control": "no-cache",
                },
            });
        }
    } catch (e) {}

    // Fallback ke Google
    try {
        const targetLang = (speaker === "male") ? "en-gb" : lang;
        const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${targetLang}&client=tw-ob`;
        const res = await fetch(googleUrl);
        const buffer = await res.arrayBuffer();
        return new NextResponse(buffer, { headers: { "Content-Type": "audio/mpeg" } });
    } catch (e) {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

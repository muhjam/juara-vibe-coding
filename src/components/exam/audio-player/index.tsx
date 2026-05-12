"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw01, VolumeMax, Zap } from "@untitledui/icons";
import { PlayIcon, PauseIcon } from "@/components/base/video-player/icons";
import { Button } from "@/components/base/buttons/button";
import { getGoogleTTSUrl, splitTextForTTS } from "@/utils/google-tts";

interface AudioPlayerProps {
    text: string;
    language?: string;
    onEnd?: () => void;
}

const LANG_TAGS: Record<string, string> = {
    English: "en-US",
    Japanese: "ja-JP",
    Korean: "ko-KR",
    French: "fr-FR",
    Spanish: "es-ES",
    Mandarin: "zh-CN",
    Arabic: "ar-SA",
    German: "de-DE",
    Italian: "it-IT",
    Portuguese: "pt-PT",
    Russian: "ru-RU",
    Hindi: "hi-IN",
    Sundanese: "su-ID",
    Javanese: "jv-ID",
    Indonesian: "id-ID",
};

const GOOGLE_LANG_MAP: Record<string, string> = {
    English: "en",
    Japanese: "ja",
    Korean: "ko",
    French: "fr",
    Spanish: "es",
    Mandarin: "zh-CN",
    Arabic: "ar",
    German: "de",
    Italian: "it",
    Portuguese: "pt",
    Russian: "ru",
    Hindi: "hi",
    Sundanese: "su",
    Javanese: "jw",
    Indonesian: "id",
};

type SpeakerType = "male" | "female" | "narrator";

interface Segment {
    text: string;
    speaker: SpeakerType;
    chunks: string[];
}

export const AudioPlayer = ({ text, language = "English", onEnd }: AudioPlayerProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const [isGoogleMode, setIsGoogleMode] = useState(true); // Default to Google for clarity

    const segmentsRef = useRef<Segment[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const isPausedRef = useRef(false);

    // Initialize audio element
    useEffect(() => {
        audioRef.current = new Audio();
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Parse text into segments based on speaker labels
    useEffect(() => {
        console.log("%c[AudioPlayer] RAW TEXT FROM AI:", "color: #f59e0b; font-weight: bold;");
        console.log(text);

        // Reset state whenever the text (question) changes
        window.speechSynthesis.cancel();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
        }

        isPausedRef.current = false;
        setIsPlaying(false);
        setProgress(0);
        setCurrentSegmentIndex(0);
        setCurrentChunkIndex(0);

        const segments: Segment[] = [];
        // Clean up common AI artifacts and HTML tags for speech
        const cleanText = text.replace(/<br\s*\/?>/gi, "\n").replace(/<\/?[^>]+(>|$)/g, "");
        const lines = cleanText.split("\n").filter(l => l.trim().length > 0);

        lines.forEach(line => {
            let speaker: SpeakerType = "narrator";
            let content = line;

            // Regex super kuat untuk mendeteksi speaker meskipun ada tanda ** atau __ atau spasi
            const speakerMatch = line.match(/^\s*(?:\*\*|__)?([\w\s]+)(?:\*\*|__)?\s*:\s*(.*)/);

            if (speakerMatch) {
                const label = speakerMatch[1].toLowerCase().trim();
                const textPart = speakerMatch[2].trim();

                if (label.includes("woman") || label.includes("female") || label.includes("girl") || label === "wanita") {
                    speaker = "female";
                    content = textPart;
                } else if (label.includes("man") || label.includes("male") || label.includes("boy") || label === "pria") {
                    speaker = "male";
                    content = textPart;
                } else if (label.length < 15) {
                    content = textPart;
                }
            }

            if (content) {
                segments.push({
                    text: content,
                    speaker,
                    chunks: splitTextForTTS(content)
                });
            }
        });

        if (segments.length === 0) {
            segments.push({
                text: cleanText,
                speaker: "narrator",
                chunks: splitTextForTTS(cleanText)
            });
        }

        segmentsRef.current = segments;
    }, [text]);

    const playGoogleChunk = useCallback((segIndex: number, chunkIndex: number) => {
        if (segIndex >= segmentsRef.current.length) {
            setIsPlaying(false);
            setProgress(100);
            onEnd?.();
            return;
        }

        const segment = segmentsRef.current[segIndex];
        if (chunkIndex >= segment.chunks.length) {
            setCurrentSegmentIndex(segIndex + 1);
            setCurrentChunkIndex(0);
            playGoogleChunk(segIndex + 1, 0);
            return;
        }

        const chunk = segment.chunks[chunkIndex];
        const langCode = GOOGLE_LANG_MAP[language] || "en";

        // Progress Calculation Helper
        const updateProgress = (currentTime: number, duration: number) => {
            const totalSegments = segmentsRef.current.length;
            const segmentWeight = 100 / totalSegments;
            const chunkWeight = segmentWeight / segment.chunks.length;
            const baseProgress = (segIndex * segmentWeight) + (chunkIndex * chunkWeight);
            const chunkProgress = (currentTime / duration) * chunkWeight;
            if (!isNaN(chunkProgress)) {
                setProgress(Math.min(99, baseProgress + chunkProgress));
            }
        };

        // LOGIKA HYBRID: Pria pakai Browser (Instan), Wanita pakai Google (Jernih)
        if (segment.speaker === "male") {
            console.log(`%c[AudioPlayer] MENGGUNAKAN SUARA SISTEM (MALE)`, "color: #059669; font-weight: bold;");
            const utterance = new SpeechSynthesisUtterance(chunk);
            utterance.lang = langCode;

            const voices = window.speechSynthesis.getVoices();
            const maleVoice = voices.find(v =>
                (v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("guy") || v.name.toLowerCase().includes("david")) &&
                v.lang.startsWith(langCode.split("-")[0])
            );
            if (maleVoice) utterance.voice = maleVoice;

            // Track progress for system voice
            const estimatedDuration = chunk.length * 0.1;
            let startTime = Date.now();
            const progressInterval = setInterval(() => {
                if (isPausedRef.current) return;
                const elapsed = (Date.now() - startTime) / 1000;
                updateProgress(elapsed, estimatedDuration);
            }, 100);

            utterance.onend = () => {
                clearInterval(progressInterval);
                if (!isPausedRef.current) playGoogleChunk(segIndex, chunkIndex + 1);
            };

            window.speechSynthesis.speak(utterance);
        } else {
            // Suara Wanita/Narrator pakai Google TTS Proxy
            const url = getGoogleTTSUrl(chunk, langCode, segment.speaker);
            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.load();

                audioRef.current.ontimeupdate = () => {
                    if (audioRef.current && audioRef.current.duration) {
                        updateProgress(audioRef.current.currentTime, audioRef.current.duration);
                    }
                };

                audioRef.current.onplay = () => {
                    // Preload next
                    let nextSeg = segIndex;
                    let nextChunk = chunkIndex + 1;
                    if (nextChunk >= segment.chunks.length) { nextSeg++; nextChunk = 0; }
                    if (nextSeg < segmentsRef.current.length) {
                        const ns = segmentsRef.current[nextSeg];
                        if (ns.speaker !== "male") {
                            const nUrl = getGoogleTTSUrl(ns.chunks[nextChunk], langCode, ns.speaker);
                            const link = document.createElement("link");
                            link.rel = "preload"; link.as = "fetch"; link.href = nUrl;
                            document.head.appendChild(link);
                            setTimeout(() => document.head.removeChild(link), 3000);
                        }
                    }
                };

                audioRef.current.onended = () => {
                    if (!isPausedRef.current) {
                        playGoogleChunk(segIndex, chunkIndex + 1);
                    }
                };

                audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            }
        }

        setCurrentSegmentIndex(segIndex);
        setCurrentChunkIndex(chunkIndex);

        console.log(`%c[AudioPlayer] SEDANG MEMUTAR: (${segment.speaker.toUpperCase()})`, "color: #7c3aed; font-weight: bold;");
        console.log(`%c"${chunk}"`, "color: #6d28d9; font-style: italic;");
    }, [language, onEnd]);

    const togglePlay = () => {
        if (isPlaying) {
            console.log("[AudioPlayer] Pausing playback");
            audioRef.current?.pause();
            isPausedRef.current = true;
            setIsPlaying(false);
        } else {
            isPausedRef.current = false;
            setIsPlaying(true);

            // Check if we have a valid source (not empty or current page)
            const currentSrc = audioRef.current?.src;
            const hasValidSource = currentSrc &&
                currentSrc !== window.location.href &&
                !currentSrc.endsWith("/");

            if (hasValidSource) {
                console.log("[AudioPlayer] Resuming playback");
                audioRef.current?.play().catch(e => {
                    console.error("[AudioPlayer] Play failed, retrying...", e);
                    playGoogleChunk(currentSegmentIndex, currentChunkIndex);
                });
            } else {
                console.log("[AudioPlayer] Starting new playback");
                playGoogleChunk(currentSegmentIndex, currentChunkIndex);
            }
        }
    };

    const restart = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.removeAttribute("src");
            audioRef.current.load();
        }

        isPausedRef.current = false;
        setCurrentSegmentIndex(0);
        setCurrentChunkIndex(0);
        setProgress(0);
        playGoogleChunk(0, 0);
        setIsPlaying(true);
    };

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-brand-200 bg-brand-soft/10 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg">
                        <VolumeMax className="size-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-brand-700">Listening Content</span>
                        <span className="text-xs text-brand-600">
                            High Quality Neural Voice ({language})
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button
                    size="md"
                    color="primary"
                    iconLeading={isPlaying ? <PauseIcon /> : <PlayIcon />}
                    onClick={togglePlay}
                    className="w-32"
                >
                    {isPlaying ? "Pause" : "Play Audio"}
                </Button>

                <Button
                    size="md"
                    color="secondary"
                    iconLeading={RefreshCw01}
                    onClick={restart}
                />

                <div className="flex-1 overflow-hidden rounded-full bg-brand-200 h-2">
                    <div
                        className="bg-brand-600 h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};


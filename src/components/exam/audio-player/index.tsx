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

type SpeakerType = "you" | "person" | "narrator";

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
        // console.log(`[AudioPlayer] Playing: ${segmentsRef.current[currentSegmentIndex]?.speaker.toUpperCase()}`);
        // console.log(text);

        // Pre-fetch voices for Safari/Chrome
        window.speechSynthesis.getVoices();
        const handleVoicesChanged = () => window.speechSynthesis.getVoices();
        window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);

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

            // Regex Universal: Mendukung Unicode (Jepang/Asia) dan Titik Dua Lebar (：)
            const speakerMatch = line.match(/^\s*(?:\*\*|__)?([^\s:：]+)(?:\*\*|__)?\s*[:：]\s*(.*)/);

            if (speakerMatch) {
                const label = speakerMatch[1].trim();
                const textPart = speakerMatch[2].trim();
                const labelLower = label.toLowerCase();

                // DETEKSI DISIPLIN: Hanya mendukung YOU, FRIEND, NARRATOR
                if (labelLower === "you") {
                    speaker = "you";
                    content = textPart;
                } else if (labelLower === "person") {
                    speaker = "person";
                    content = textPart;
                } else if (labelLower === "narrator") {
                    speaker = "narrator";
                    content = textPart;
                } else if (label.length < 10) {
                    content = textPart;
                }

                // console.log(`[AudioPlayer] Label: ${label} -> Speaker: ${speaker.toUpperCase()}`);
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
        // Map YOU -> female voice, FRIEND -> narrator voice (kedua suara wanita, tapi karakter berbeda)
        const voiceRole = segment.speaker === "you" ? "female" : segment.speaker === "person" ? "narrator" : "narrator";
        const url = getGoogleTTSUrl(chunk, langCode, voiceRole);

        if (audioRef.current) {
            // YOU: Sedikit lebih cepat (karakter aktif), FRIEND: Normal
            if (segment.speaker === "you") {
                audioRef.current.playbackRate = 1.05;
                if ("preservesPitch" in audioRef.current) {
                    (audioRef.current as any).preservesPitch = true;
                }
            } else {
                audioRef.current.playbackRate = 1.0;
                if ("preservesPitch" in audioRef.current) {
                    (audioRef.current as any).preservesPitch = true;
                }
            }

            audioRef.current.src = url;
            audioRef.current.load();

            audioRef.current.ontimeupdate = () => {
                if (audioRef.current && audioRef.current.duration) {
                    const totalSegments = segmentsRef.current.length;
                    const segmentWeight = 100 / totalSegments;
                    const chunkWeight = segmentWeight / segment.chunks.length;
                    const baseProgress = (segIndex * segmentWeight) + (chunkIndex * chunkWeight);
                    const chunkProgress = (audioRef.current.currentTime / audioRef.current.duration) * chunkWeight;
                    if (!isNaN(chunkProgress)) {
                        setProgress(Math.min(99, baseProgress + chunkProgress));
                    }
                }
            };

            audioRef.current.onended = () => {
                if (!isPausedRef.current) {
                    playGoogleChunk(segIndex, chunkIndex + 1);
                }
            };

            audioRef.current.play().catch(e => {
                // Safari might block this if not triggered by user gesture
                // In that case, we fallback to starting the next chunk on the next manual play
            });
        }

        setCurrentSegmentIndex(segIndex);
        setCurrentChunkIndex(chunkIndex);
        // console.log(`[AudioPlayer] Playing: ${segment.speaker.toUpperCase()}`);
    }, [language, onEnd]);

    const togglePlay = () => {
        // SAFARI FIX: Unlock audio context on first interaction
        if (!isPlaying && !isPausedRef.current) {
            if (audioRef.current) {
                audioRef.current.play().then(() => audioRef.current?.pause()).catch(() => { });
            }
        }

        if (isPlaying) {
            // console.log("[AudioPlayer] Pausing playback");
            audioRef.current?.pause();
            isPausedRef.current = true;
            setIsPlaying(false);
        } else {
            isPausedRef.current = false;
            setIsPlaying(true);

            const currentSrc = audioRef.current?.src;
            const hasValidSource = currentSrc &&
                currentSrc !== window.location.href &&
                !currentSrc.endsWith("/");

            if (hasValidSource) {
                // console.log("[AudioPlayer] Resuming playback");
                audioRef.current?.play().catch(e => {
                    // console.error("[AudioPlayer] Play failed, retrying...", e);
                    playGoogleChunk(currentSegmentIndex, currentChunkIndex);
                });
            } else {
                // console.log("[AudioPlayer] Starting new playback");
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
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-brand-600">
                                Neural Voice ({language})
                            </span>
                            {isPlaying && (
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm ${segmentsRef.current[currentSegmentIndex]?.speaker === "you"
                                        ? "bg-teal-600"
                                        : segmentsRef.current[currentSegmentIndex]?.speaker === "person"
                                            ? "bg-orange-500"
                                            : "bg-slate-500"
                                    }`}>
                                    {segmentsRef.current[currentSegmentIndex]?.speaker === "you" ? "You" : segmentsRef.current[currentSegmentIndex]?.speaker === "person" ? "Person" : "Narrator"}
                                </span>
                            )}
                        </div>
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


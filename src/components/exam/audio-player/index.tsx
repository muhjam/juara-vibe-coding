"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw01, VolumeMax } from "@untitledui/icons";
import { PlayIcon, PauseIcon } from "@/components/base/video-player/icons";
import { Button } from "@/components/base/buttons/button";

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
};

type SpeakerType = "male" | "female" | "narrator";

interface Segment {
    text: string;
    speaker: SpeakerType;
}

export const AudioPlayer = ({ text, language = "English", onEnd }: AudioPlayerProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const segmentsRef = useRef<Segment[]>([]);
    const isPausedRef = useRef(false);

    // Parse text into segments based on speaker labels
    useEffect(() => {
        const segments: Segment[] = [];
        // Clean up common AI artifacts and HTML tags for speech
        const cleanText = text.replace(/<br\s*\/?>/gi, "\n").replace(/<\/?[^>]+(>|$)/g, "");
        const lines = cleanText.split("\n").filter(l => l.trim().length > 0);

        lines.forEach(line => {
            const lower = line.toLowerCase();
            let speaker: SpeakerType = "narrator";
            let content = line;

            if (lower.startsWith("man:") || lower.startsWith("boy:") || lower.startsWith("male:")) {
                speaker = "male";
                content = line.split(":").slice(1).join(":").trim();
            } else if (lower.startsWith("woman:") || lower.startsWith("girl:") || lower.startsWith("female:")) {
                speaker = "female";
                content = line.split(":").slice(1).join(":").trim();
            } else if (lower.includes(":")) {
                // Check if the label before colon might be a name, default to narrator or try to guess?
                // For simplicity, if it's not explicitly male/female, we use narrator unless it's a dialogue
                content = line.split(":").slice(1).join(":").trim();
            }

            if (content) {
                segments.push({ text: content, speaker });
            }
        });

        if (segments.length === 0) {
            segments.push({ text: cleanText, speaker: "narrator" });
        }

        segmentsRef.current = segments;
    }, [text]);

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
        };

        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    const getVoice = useCallback((speaker: SpeakerType) => {
        const langCode = LANG_TAGS[language] || "en-US";
        const langPrefix = langCode.split("-")[0];

        const langVoices = voices.filter(v => v.lang.startsWith(langPrefix));
        if (langVoices.length === 0) return null;

        // 1. Find HIGH QUALITY voices first
        const highQualityVoices = langVoices.filter(v =>
            v.name.toLowerCase().includes("google") ||
            v.name.toLowerCase().includes("natural") ||
            v.name.toLowerCase().includes("neural")
        );

        // 2. Find STANDARD (robotic) voices
        const standardVoices = langVoices.filter(v => !highQualityVoices.includes(v));

        if (speaker === "male") {
            // Priority: High quality male
            const naturalMale = highQualityVoices.find(v =>
                v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("alex") || v.name.toLowerCase().includes("daniel")
            );
            if (naturalMale) return naturalMale;

            // Fallback to any high quality if no specific male high quality found
            if (highQualityVoices.length > 0) return highQualityVoices[0];

            // Extreme fallback to standard male
            return standardVoices.find(v => v.name.toLowerCase().includes("male")) || langVoices[0];
        }

        if (speaker === "female") {
            // Priority: High quality female
            const naturalFemale = highQualityVoices.find(v =>
                v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("karen")
            );
            if (naturalFemale) return naturalFemale;

            // Fallback to any high quality (try to avoid the first one if it's male)
            if (highQualityVoices.length > 1) return highQualityVoices[1];
            if (highQualityVoices.length > 0) return highQualityVoices[0];

            // Extreme fallback to standard female
            return standardVoices.find(v => v.name.toLowerCase().includes("female")) || langVoices[Math.min(1, langVoices.length - 1)];
        }

        // Narrator: specifically pick a ROBOTIC male voice
        const roboticMale = standardVoices.find(v =>
            v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("alex") || v.name.toLowerCase().includes("microsoft")
        );

        return roboticMale || standardVoices[0] || langVoices[0];
    }, [voices, language]);

    const playSegment = useCallback((index: number) => {
        if (index >= segmentsRef.current.length) {
            setIsPlaying(false);
            setProgress(100);
            onEnd?.();
            return;
        }

        const segment = segmentsRef.current[index];
        const utterance = new SpeechSynthesisUtterance(segment.text);
        utterance.lang = LANG_TAGS[language] || "en-US";
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        const voice = getVoice(segment.speaker);
        if (voice) {
            utterance.voice = voice;
        }

        utterance.onend = () => {
            if (!isPausedRef.current) {
                setCurrentSegmentIndex(index + 1);
                playSegment(index + 1);
            }
        };

        utterance.onboundary = (event) => {
            if (event.name === "word") {
                // Calculate overall progress across all segments
                const totalChars = segmentsRef.current.reduce((acc, s) => acc + s.text.length, 0);
                const charsBefore = segmentsRef.current.slice(0, index).reduce((acc, s) => acc + s.text.length, 0);
                const currentProgress = ((charsBefore + event.charIndex) / totalChars) * 100;
                setProgress(currentProgress);
            }
        };

        setCurrentSegmentIndex(index);
        window.speechSynthesis.speak(utterance);
    }, [language, getVoice, onEnd]);

    const togglePlay = () => {
        if (isPlaying) {
            window.speechSynthesis.pause();
            isPausedRef.current = true;
            setIsPlaying(false);
        } else {
            if (window.speechSynthesis.paused && isPausedRef.current) {
                window.speechSynthesis.resume();
                isPausedRef.current = false;
            } else {
                window.speechSynthesis.cancel();
                isPausedRef.current = false;
                playSegment(currentSegmentIndex);
            }
            setIsPlaying(true);
        }
    };

    const restart = () => {
        window.speechSynthesis.cancel();
        isPausedRef.current = false;
        setCurrentSegmentIndex(0);
        setProgress(0);
        playSegment(0);
        setIsPlaying(true);
    };

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-brand-200 bg-brand-soft/10 p-6">
            <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg">
                    <VolumeMax className="size-6" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-brand-700">Listening Content</span>
                    <span className="text-xs text-brand-600">
                        {segmentsRef.current.length > 1 ? "Dialogue with multiple speakers" : "Single speaker audio"}
                    </span>
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

            {isPlaying && segmentsRef.current[currentSegmentIndex] && (
                <div className="text-xs font-medium text-brand-500 animate-pulse">
                    Speaking: {segmentsRef.current[currentSegmentIndex].speaker.toUpperCase()}
                </div>
            )}
        </div>
    );
};

"use client";

import { useState, useEffect, useRef } from "react";
import { RefreshCw01, VolumeMax } from "@untitledui/icons";
import { PlayIcon, PauseIcon } from "@/components/base/video-player/icons";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

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
};

export const AudioPlayer = ({ text, language = "English", onEnd }: AudioPlayerProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

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

    useEffect(() => {
        // Prepare utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = LANG_TAGS[language] || "en-US";
        utterance.rate = 0.9; // Slightly slower for better clarity in tests

        // Try to find a suitable voice for the specific language
        const targetVoice = voices.find(v =>
            v.lang.startsWith(utterance.lang.split("-")[0]) &&
            (v.name.toLowerCase().includes("male") ||
                v.name.toLowerCase().includes("david") ||
                v.name.toLowerCase().includes("alex") ||
                v.name.toLowerCase().includes("daniel") ||
                v.name.toLowerCase().includes("guy"))
        );

        if (targetVoice) {
            utterance.voice = targetVoice;
        }

        utterance.onend = () => {
            setIsPlaying(false);
            setProgress(100);
            onEnd?.();
        };

        utterance.onboundary = (event) => {
            if (event.name === "word") {
                const percentage = (event.charIndex / text.length) * 100;
                setProgress(percentage);
            }
        };

        utteranceRef.current = utterance;

        return () => {
            window.speechSynthesis.cancel();
        };
    }, [text, onEnd, voices]);

    const togglePlay = () => {
        if (isPlaying) {
            window.speechSynthesis.pause();
            setIsPlaying(false);
        } else {
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
            } else {
                window.speechSynthesis.cancel();
                if (utteranceRef.current) {
                    window.speechSynthesis.speak(utteranceRef.current);
                }
            }
            setIsPlaying(true);
        }
    };

    const restart = () => {
        window.speechSynthesis.cancel();
        if (utteranceRef.current) {
            window.speechSynthesis.speak(utteranceRef.current);
            setIsPlaying(true);
            setProgress(0);
        }
    };

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-brand-200 bg-brand-soft/10 p-6">
            <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg">
                    <VolumeMax className="size-6" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-brand-700">Listening Content</span>
                    <span className="text-xs text-brand-600">Click play to listen to the question</span>
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

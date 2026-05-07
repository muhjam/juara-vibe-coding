"use client";

import { Microphone01, StopCircle, Zap } from "@untitledui/icons";
import { useState, useRef, useEffect } from "react";
import { cx } from "@/utils/cx";

interface SpeakingInputProps {
    value: string;
    onChange: (val: string) => void;
    language: string;
    isRecording: boolean;
    setIsRecording: (val: boolean) => void;
}

const LANG_MAP: Record<string, string> = {
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

export const SpeakingInput = ({ value, onChange, language, isRecording, setIsRecording }: SpeakingInputProps) => {
    const [interimTranscript, setInterimTranscript] = useState("");
    const recognitionRef = useRef<any>(null);
    const transcriptRef = useRef("");
    const shouldRestartRef = useRef(false);

    // Sync ref with prop value when not recording
    useEffect(() => {
        if (!isRecording) {
            transcriptRef.current = value;
        }
    }, [value, isRecording]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startRecording = () => {
        if (typeof window === "undefined" || !("webkitSpeechRecognition" in window)) {
            // Fallback
            setIsRecording(true);
            setTimeout(() => {
                onChange("(Speech recognition not supported in this browser)");
                setIsRecording(false);
            }, 2000);
            return;
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = LANG_MAP[language] || "en-US";
        recognition.interimResults = true;
        recognition.continuous = true;

        recognition.onstart = () => {
            setIsRecording(true);
            setInterimTranscript("");
            transcriptRef.current = "";
            shouldRestartRef.current = true;
            onChange(""); 
        };

        recognition.onresult = (event: any) => {
            let finalTranscript = "";
            let currentInterim = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    currentInterim += transcript;
                }
            }

            if (finalTranscript) {
                transcriptRef.current += (transcriptRef.current ? " " : "") + finalTranscript;
                onChange(transcriptRef.current);
            }
            setInterimTranscript(currentInterim);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            shouldRestartRef.current = false;
            setIsRecording(false);
        };

        recognition.onend = () => {
            if (shouldRestartRef.current && isRecording) {
                // Add a small delay to avoid rapid-fire restarts
                setTimeout(() => {
                    if (shouldRestartRef.current && isRecording && recognitionRef.current) {
                        try {
                            recognitionRef.current.start();
                        } catch (e) {
                            console.error("Failed to restart recognition:", e);
                            setIsRecording(false);
                            shouldRestartRef.current = false;
                        }
                    }
                }, 500);
            } else {
                setIsRecording(false);
                setInterimTranscript("");
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopRecording = () => {
        shouldRestartRef.current = false;
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsRecording(false);
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <div className="flex flex-col items-center gap-6 py-8">
            <div className="relative">
                <button
                    onClick={toggleRecording}
                    className={cx(
                        "relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl",
                        isRecording
                            ? "bg-error-500 text-white scale-110 ring-8 ring-error-100"
                            : "bg-white text-brand-600 border-2 border-brand-200 hover:border-brand-500 hover:scale-105"
                    )}
                >
                    {isRecording && (
                        <span className="absolute inset-0 rounded-full bg-error-500 animate-ping opacity-20" />
                    )}
                    {isRecording
                        ? <StopCircle className="w-12 h-12 relative z-10" />
                        : <Microphone01 className="w-12 h-12 relative z-10" />
                    }
                </button>
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-md font-semibold text-primary">
                    {isRecording ? "Listening... Speak now" : value ? "Recording Complete" : "Ready to Record"}
                </p>
                <p className="text-sm text-tertiary">
                    {isRecording
                        ? "Click the red button when you're finished."
                        : value
                        ? "Click the mic again to replace your recording."
                        : "Click the mic and wait for the red circle."}
                </p>
            </div>

            {(isRecording || value) && (
                <div className="w-full max-w-lg rounded-2xl border-2 border-dashed border-secondary bg-secondary/30 p-6 transition-all duration-300">
                    <div className="flex items-start gap-3">
                        <Zap className={cx("size-5 mt-0.5", isRecording ? "text-brand-500 animate-pulse" : "text-tertiary")} />
                        <div className="flex-1">
                            <p className="text-xs font-bold uppercase tracking-wider text-tertiary mb-2">Live Transcript</p>
                            <p className={cx(
                                "text-lg font-medium leading-relaxed",
                                isRecording ? "text-primary" : "text-secondary"
                            )}>
                                {isRecording ? (
                                    <>
                                        {value}
                                        <span className="text-brand-600">{interimTranscript}</span>
                                        <span className="inline-block w-1 h-5 ml-1 bg-brand-500 animate-pulse align-middle" />
                                    </>
                                ) : (
                                    value || "No speech detected yet..."
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

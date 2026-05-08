"use client";

import { Microphone01, StopCircle, Zap } from "@untitledui/icons";
import { useState, useRef, useEffect } from "react";
import { cx } from "@/utils/cx";
import { useToast } from "@/contexts/use-toast";

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
    const { toastError, toastSuccess } = useToast();
    const [isTranscribing, setIsTranscribing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
            }
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const startRecording = async () => {
        try {
            // Stop any ongoing TTS before starting recording
            if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
                
                // Automatically transcribe once recording stops
                handleTranscription(audioBlob);
                
                // Stop all tracks in the stream
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            onChange(""); 
        } catch (err: any) {
            console.error("Failed to start recording:", err);
            toastError("Could not access microphone. Please check your permissions.", "Microphone Error");
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    };

    const handleTranscription = async (blob: Blob) => {
        setIsTranscribing(true);
        try {
            const formData = new FormData();
            formData.append("file", blob, "recording.webm");
            formData.append("language", language);

            const response = await fetch("/api/transcribe", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Transcription failed");

            if (!data.text || data.text.trim() === "") {
                toastError("No speech detected. Please speak more clearly or check your mic.", "Empty Result");
            } else {
                onChange(data.text);
                toastSuccess("Voice transcribed successfully!", "Success");
            }
        } catch (err: any) {
            console.error("Transcription Error:", err);
            toastError(err.message || "Failed to transcribe audio. Please try again.", "Transcription Error");
        } finally {
            setIsTranscribing(false);
        }
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
                    disabled={isTranscribing}
                    className={cx(
                        "relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl",
                        isRecording
                            ? "bg-error-500 text-white scale-110 ring-8 ring-error-100"
                            : isTranscribing
                            ? "bg-brand-100 text-brand-600 cursor-not-allowed"
                            : "bg-white text-brand-600 border-2 border-brand-200 hover:border-brand-500 hover:scale-105"
                    )}
                >
                    {isRecording && (
                        <span className="absolute inset-0 rounded-full bg-error-500 animate-ping opacity-20" />
                    )}
                    {isTranscribing ? (
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-600 border-t-transparent" />
                    ) : isRecording ? (
                        <StopCircle className="w-12 h-12 relative z-10" />
                    ) : (
                        <Microphone01 className="w-12 h-12 relative z-10" />
                    )}
                </button>
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-md font-semibold text-primary">
                    {isRecording ? "Listening... Speak now" : isTranscribing ? "Transcribing audio..." : value ? "Recording Complete" : "Ready to Record"}
                </p>
                <p className="text-sm text-tertiary">
                    {isRecording
                        ? "Click the red button when you're finished."
                        : isTranscribing
                        ? "Wait a moment while we process your voice..."
                        : value
                        ? "Click the mic again to replace your recording."
                        : "Click the mic and wait for the red circle."}
                </p>
            </div>

            {(isRecording || isTranscribing || value) && (
                <div className="w-full max-w-lg rounded-2xl border-2 border-dashed border-secondary bg-secondary/30 p-6 transition-all duration-300">
                    <div className="flex items-start gap-3">
                        <Zap className={cx("size-5 mt-0.5", (isRecording || isTranscribing) ? "text-brand-500 animate-pulse" : "text-tertiary")} />
                        <div className="flex-1">
                            <p className="text-xs font-bold uppercase tracking-wider text-tertiary mb-2">
                                {isRecording ? "Recording..." : isTranscribing ? "AI is transcribing..." : "Transcript"}
                            </p>
                            <div className={cx(
                                "text-lg font-medium leading-relaxed min-h-[1.5em]",
                                isTranscribing ? "text-tertiary italic" : "text-primary"
                            )}>
                                {isRecording ? (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-brand-600 font-semibold animate-pulse">Listening to your voice...</p>
                                        {value && <p className="text-sm text-tertiary opacity-60 italic">Previous: {value}</p>}
                                    </div>
                                ) : isTranscribing ? (
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <div className="w-1 h-4 bg-brand-500 animate-bounce [animation-delay:-0.3s]" />
                                            <div className="w-1 h-4 bg-brand-500 animate-bounce [animation-delay:-0.15s]" />
                                            <div className="w-1 h-4 bg-brand-500 animate-bounce" />
                                        </div>
                                        <span>Converting speech to text...</span>
                                    </div>
                                ) : (
                                    value || "No speech detected yet..."
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

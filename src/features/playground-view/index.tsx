"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/base/buttons/button";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { Card } from "@/components/base/card";
import { useRouter } from "next/navigation";
import { parseAIResponse, Question } from "@/lib/ai/parser";
import { Microphone01, Play, StopCircle } from "@untitledui/icons";

export const PlaygroundView = () => {
    const router = useRouter();
    const [config, setConfig] = useState<any>(null);
    const [currentIndex, setCurrentIndex] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const savedConfig = localStorage.getItem("lang-test-config");
        if (savedConfig) {
            const parsed = JSON.parse(savedConfig);
            setConfig(parsed);
            fetchQuestion(1, parsed);
        } else {
            router.push("/");
        }
    }, []);

    const fetchQuestion = async (index: number, currentConfig: any) => {
        setIsLoading(true);
        setCurrentQuestion(null);
        try {
            const skill = currentConfig.skills[Math.floor(Math.random() * currentConfig.skills.length)];

            const res = await fetch("/api/generate-question", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    index,
                    skill,
                    type: currentConfig.type,
                    language: currentConfig.language
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            const parsed = parseAIResponse(data.rawResponse);
            if (parsed.length > 0) {
                const newQuestion = parsed[0];
                setCurrentQuestion(newQuestion);
                setQuestions(prev => {
                    const updated = [...prev];
                    updated[index - 1] = newQuestion;
                    return updated;
                });
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = () => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setIsRecording(false);

        if (currentIndex < config.questionCount) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            fetchQuestion(nextIndex, config);
        } else {
            // Save all data including full question objects for Review Mode
            localStorage.setItem("lang-test-results", JSON.stringify({
                config,
                answers,
                questions
            }));
            router.push("/result");
        }
    };

    const handlePlayAudio = () => {
        if (!currentQuestion) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(currentQuestion.description.replace(/<[^>]*>/g, ""));
        const langMap: Record<string, string> = {
            English: "en-US",
            Japanese: "ja-JP",
            Korean: "ko-KR",
            French: "fr-FR",
        };
        utterance.lang = langMap[config?.language] || "en-US";
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
    };

    const toggleRecording = () => {
        if (isRecording) {
            setIsRecording(false);
            return;
        }
        setIsRecording(true);
        // Use Web Speech API for transcription
        if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = config?.language === "Japanese" ? "ja-JP" : "en-US";
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setAnswers(prev => ({ ...prev, [currentIndex]: transcript }));
                setIsRecording(false);
            };
            recognition.onerror = () => setIsRecording(false);
            recognition.onend = () => setIsRecording(false);
            recognition.start();
        } else {
            // Fallback
            setTimeout(() => {
                setAnswers(prev => ({ ...prev, [currentIndex]: "(Rekaman audio tidak didukung di browser ini)" }));
                setIsRecording(false);
            }, 2000);
        }
    };

    if (!config) return null;

    const progress = ((currentIndex) / config.questionCount) * 100;
    const skillColor: Record<string, string> = {
        Reading: "bg-blue-100 text-blue-700",
        Writing: "bg-emerald-100 text-emerald-700",
        Listening: "bg-purple-100 text-purple-700",
        Speaking: "bg-amber-100 text-amber-700",
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header & Progress */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                {config.language} · Soal {currentIndex} dari {config.questionCount}
                            </p>
                            <h1 className="text-2xl font-bold text-slate-900">Mari Berlatih</h1>
                        </div>
                        <Button color="secondary" onClick={() => {
                            window.speechSynthesis.cancel();
                            router.push("/");
                        }}>Keluar</Button>
                    </div>
                    <ProgressBar value={progress} />
                </div>

                {/* Content Area */}
                <Card className="p-8 md:p-12 min-h-[500px] bg-white shadow-sm border-slate-200">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4 py-20">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-t-slate-900 animate-spin"></div>
                            </div>
                            <p className="text-slate-500 font-medium">Menghasilkan soal berikutnya...</p>
                        </div>
                    ) : currentQuestion ? (
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${skillColor[currentQuestion.skill] || "bg-slate-100 text-slate-600"}`}>
                                    {currentQuestion.skill}
                                </span>

                                {/* Listening: Custom Audio Player */}
                                {currentQuestion.skill === "Listening" && (
                                    <div className="bg-slate-50 p-6 rounded-2xl flex items-center gap-6 border border-slate-100">
                                        <button
                                            onClick={handlePlayAudio}
                                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shrink-0 ${
                                                isPlaying ? "bg-red-500 text-white animate-pulse" : "bg-slate-900 text-white hover:scale-105"
                                            }`}
                                        >
                                            {isPlaying ? <StopCircle className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                                        </button>
                                        <div className="flex-1 space-y-1">
                                            <p className="font-bold text-slate-900">Audio Percakapan</p>
                                            <p className="text-sm text-slate-500">
                                                {isPlaying ? "Sedang diputar..." : "Klik play untuk mendengarkan soal."}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Question text */}
                                <div
                                    className="prose prose-slate max-w-none text-lg text-slate-800 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: currentQuestion.description }}
                                />
                            </div>

                            {/* Answer Area */}
                            <div className="space-y-4 pt-6 border-t border-slate-100">
                                {currentQuestion.skill === "Speaking" ? (
                                    <div className="flex flex-col items-center justify-center py-8 space-y-6">
                                        <button
                                            onClick={toggleRecording}
                                            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl ${
                                                isRecording
                                                    ? "bg-red-500 text-white scale-110 ring-8 ring-red-100"
                                                    : "bg-white text-slate-900 border-4 border-slate-100 hover:border-slate-900"
                                            }`}
                                        >
                                            <Microphone01 className="w-10 h-10" />
                                        </button>
                                        <p className="text-slate-500 font-medium">
                                            {isRecording ? "Sedang mendengarkan... klik lagi untuk berhenti" : "Klik mic dan mulailah berbicara"}
                                        </p>
                                        {answers[currentIndex] && (
                                            <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm border border-green-100 w-full text-center">
                                                ✓ {answers[currentIndex]}
                                            </div>
                                        )}
                                    </div>
                                ) : currentQuestion.options ? (
                                    <div className="grid grid-cols-1 gap-3">
                                        {currentQuestion.options.map((opt, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setAnswers(prev => ({ ...prev, [currentIndex]: opt }))}
                                                className={`p-4 text-left rounded-xl border-2 transition-all font-medium ${
                                                    answers[currentIndex] === opt
                                                        ? "border-slate-900 bg-slate-50 shadow-md"
                                                        : "border-slate-100 hover:border-slate-300 text-slate-700"
                                                }`}
                                            >
                                                <span className="font-bold mr-3 text-slate-400">{String.fromCharCode(65 + i)}.</span>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <textarea
                                        className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-slate-900 outline-none min-h-[150px] text-lg text-slate-800 resize-none transition-all"
                                        placeholder="Ketik jawaban Anda di sini..."
                                        value={answers[currentIndex] || ""}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, [currentIndex]: e.target.value }))}
                                    />
                                )}
                            </div>

                            <div className="flex justify-end pt-8">
                                <Button
                                    size="lg"
                                    className="bg-slate-900 text-white min-w-[180px]"
                                    onClick={handleNext}
                                    isDisabled={!answers[currentIndex]}
                                >
                                    {currentIndex === config.questionCount ? "Selesai & Lihat Hasil" : "Soal Berikutnya →"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 space-y-4">
                            <p className="text-slate-400 text-lg">Gagal memuat soal.</p>
                            <Button color="secondary" onClick={() => fetchQuestion(currentIndex, config)}>
                                Coba Lagi
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

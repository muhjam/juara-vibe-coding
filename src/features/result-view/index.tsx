"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { Card } from "@/components/base/card";
import { useRouter } from "next/navigation";
import { Question } from "@/lib/ai/parser";

export const ResultView = () => {
    const router = useRouter();
    const [results, setResults] = useState<any>(null);
    const [showReview, setShowReview] = useState(false);

    useEffect(() => {
        const savedResults = localStorage.getItem("lang-test-results");
        if (savedResults) {
            setResults(JSON.parse(savedResults));
        } else {
            router.push("/");
        }
    }, []);

    if (!results) return null;

    const { config, answers, questions } = results;
    const totalQuestions = config.questionCount;
    const answeredCount = Object.keys(answers).length;

    const skillBadgeColor: Record<string, string> = {
        Reading: "bg-blue-100 text-blue-700",
        Writing: "bg-emerald-100 text-emerald-700",
        Listening: "bg-purple-100 text-purple-700",
        Speaking: "bg-amber-100 text-amber-700",
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full text-green-600 mb-4">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900">Ujian Selesai!</h1>
                    <p className="text-slate-500 text-lg">
                        Anda telah menyelesaikan tes bahasa <strong>{config.language}</strong>.
                    </p>
                </div>

                {/* Summary Card */}
                <Card className="p-8 bg-white shadow-sm border-none">
                    <div className="grid grid-cols-3 gap-8 divide-x divide-slate-100">
                        <div className="text-center space-y-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Soal</p>
                            <p className="text-4xl font-bold text-slate-900">{totalQuestions}</p>
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Terjawab</p>
                            <p className="text-4xl font-bold text-emerald-600">{answeredCount}</p>
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dilewati</p>
                            <p className="text-4xl font-bold text-slate-400">{totalQuestions - answeredCount}</p>
                        </div>
                    </div>

                    <div className="mt-8 space-y-3 pt-8 border-t border-slate-100">
                        <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Ringkasan Sesi</h3>
                        <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Bahasa</span>
                                <span className="font-bold text-slate-900">{config.language}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Skills</span>
                                <div className="flex gap-1 flex-wrap justify-end">
                                    {config.skills.map((s: string) => (
                                        <span key={s} className={`px-2 py-0.5 rounded-full text-xs font-bold ${skillBadgeColor[s] || "bg-slate-100 text-slate-600"}`}>{s}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Tipe Soal</span>
                                <span className="font-bold text-slate-900">{config.type}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 space-y-3">
                        {questions && questions.length > 0 && (
                            <Button
                                color="secondary"
                                className="w-full"
                                onClick={() => setShowReview(!showReview)}
                            >
                                {showReview ? "Tutup Review" : "📋 Review Jawaban"}
                            </Button>
                        )}
                        <Button
                            className="w-full bg-slate-900 text-white"
                            size="lg"
                            onClick={() => router.push("/")}
                        >
                            Mulai Tes Baru
                        </Button>
                    </div>
                </Card>

                {/* Review Section */}
                {showReview && questions && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-900">Review Jawaban</h2>
                        {(questions as Question[]).map((q, i) => {
                            const userAnswer = answers[i + 1];
                            const isCorrect = q.options
                                ? userAnswer === q.answer
                                : !!userAnswer;

                            return (
                                <Card key={i} className={`p-6 border-2 ${isCorrect ? "border-emerald-200 bg-emerald-50/30" : "border-rose-200 bg-rose-50/30"}`}>
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold ${skillBadgeColor[q.skill] || "bg-slate-100 text-slate-600"}`}>
                                                {q.skill}
                                            </span>
                                            <span className={`shrink-0 text-sm font-bold ${isCorrect ? "text-emerald-600" : "text-rose-500"}`}>
                                                {isCorrect ? "✓ Benar" : "✗ Salah"}
                                            </span>
                                        </div>
                                        <p className="font-semibold text-slate-900 text-sm">Soal #{i + 1}</p>
                                        <div
                                            className="text-slate-700 text-sm leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: q.description }}
                                        />

                                        {q.options && (
                                            <div className="grid grid-cols-1 gap-2 pt-2">
                                                {q.options.map((opt, oi) => (
                                                    <div key={oi} className={`p-3 rounded-lg text-sm ${
                                                        opt === q.answer
                                                            ? "bg-emerald-100 text-emerald-800 font-bold"
                                                            : opt === userAnswer && opt !== q.answer
                                                            ? "bg-rose-100 text-rose-800 line-through"
                                                            : "bg-white text-slate-600"
                                                    }`}>
                                                        {String.fromCharCode(65 + oi)}. {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="pt-2 space-y-1">
                                            <p className="text-xs font-semibold text-slate-500 uppercase">Jawaban Anda</p>
                                            <p className={`text-sm font-medium ${isCorrect ? "text-emerald-700" : "text-rose-600"}`}>
                                                {userAnswer || "(Tidak dijawab)"}
                                            </p>
                                        </div>

                                        {!isCorrect && q.answer && (
                                            <div className="pt-2 space-y-1">
                                                <p className="text-xs font-semibold text-slate-500 uppercase">Jawaban Benar</p>
                                                <p className="text-sm font-medium text-emerald-700">{q.answer}</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    );
};

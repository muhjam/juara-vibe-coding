"use client";

import { useRouter, useParams } from "next/navigation";
import { CheckCircle, Home01, RefreshCcw01, XCircle, Zap } from "@untitledui/icons";
import { Button } from "../../components/base/buttons/button";
import { FeaturedIcon } from "../../components/foundations/featured-icon/featured-icon";
import { useEffect } from "react";
import { useExamStore, useActiveExam } from "../../store/use-exam-store";
import { cx } from "../../utils/cx";
import { Markdown } from "../../components/shared-assets/markdown";
import { calculateSimilarity } from "../../utils/string-similarity";

export const ResultScreen = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const activeExam = useActiveExam();
    const { selectExam, exams, retryActiveExam } = useExamStore();

    // Sync active exam with URL
    useEffect(() => {
        if (id && id !== activeExam?.id) {
            selectExam(id);
        }
    }, [id, activeExam?.id, selectExam]);

    if (!activeExam || (activeExam.id !== id && exams.find(e => e.id === id))) {
        return <div className="flex h-dvh items-center justify-center">Loading results...</div>;
    }

    if (!activeExam || activeExam.questions.length === 0) {
        router.push("/");
        return null;
    }

    const { questions, userAnswers } = activeExam;

    const gradableQuestions = questions.filter(q => !!q.options || q.skill.toLowerCase() === "writing" || q.skill.toLowerCase() === "speaking");
    
    const correctAnswersCount = gradableQuestions.filter(q => {
        const userAnswerRaw = userAnswers[q.id] || "";
        
        if (q.options) {
            return userAnswerRaw === q.answer;
        }
        
        if (q.skill.toLowerCase() === "writing" || q.skill.toLowerCase() === "speaking") {
            try {
                if (q.skill.toLowerCase() === "writing") {
                    // For writing, answers are stored as a JSON array of strings
                    const userAnsArr = JSON.parse(userAnswerRaw || "[]");
                    const correctAnsArr = q.answer.split("|->").map(a => a.trim());
                    
                    if (correctAnsArr.length === 0) return false;
                    
                    // Calculate average similarity across all blanks
                    let totalSimilarity = 0;
                    correctAnsArr.forEach((correct, idx) => {
                        totalSimilarity += calculateSimilarity(userAnsArr[idx] || "", correct);
                    });
                    
                    const averageSimilarity = totalSimilarity / correctAnsArr.length;
                    return averageSimilarity >= 0.8;
                }
                
                return calculateSimilarity(userAnswerRaw, q.answer) >= 0.7;
            } catch {
                return calculateSimilarity(userAnswerRaw, q.answer) >= 0.7;
            }
        }
        
        return false;
    }).length;

    const scorePercentage = gradableQuestions.length > 0
        ? Math.round((correctAnswersCount / gradableQuestions.length) * 100)
        : 100;

    const handleRestart = () => {
        retryActiveExam();
        router.push(`/playground/${activeExam.id}`);
    };

    return (
        <div className="flex min-h-dvh flex-col bg-primary px-4 py-8 md:px-8">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">

                {/* Score Summary */}
                <div className="flex flex-col items-center gap-6 text-center">
                    <div className="relative">
                        <FeaturedIcon icon={Zap} color="brand" theme="dark" size="xl" />
                        <div className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-success-600 text-[10px] font-bold text-white ring-2 ring-white">
                            {scorePercentage}%
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h1 className="text-display-sm font-semibold text-primary">Exam Completed!</h1>
                        <p className="text-lg text-tertiary">
                            You answered {correctAnswersCount} out of {gradableQuestions.length} questions correctly.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button color="secondary" size="lg" iconLeading={RefreshCcw01} onClick={handleRestart}>
                            Retry Test
                        </Button>
                        <Button size="lg" iconLeading={Home01} onClick={() => router.push("/")}>
                            Back to Home
                        </Button>
                    </div>
                </div>

                <hr className="border-secondary" />

                {/* Question Review */}
                <div className="flex flex-col gap-6">
                    <h2 className="text-xl font-semibold text-primary">Question Review</h2>

                    <div className="flex flex-col gap-4">
                        {questions.map((q, idx) => {
                            const isMC = !!q.options;
                            const isWriting = q.skill.toLowerCase() === "writing";
                            const userAnswerRaw = userAnswers[q.id] || "";
                            
                            let isCorrect = false;
                            let similarity = 0;
                            let userAnsDisplay = userAnswerRaw;

                            if (isMC) {
                                isCorrect = userAnswerRaw === q.answer;
                            } else if (isWriting || q.skill.toLowerCase() === "speaking") {
                                if (isWriting) {
                                    try {
                                        const userAnsArr = JSON.parse(userAnswerRaw || "[]");
                                        const correctAnsArr = q.answer.split("|->").map(a => a.trim());
                                        
                                        let totalSimilarity = 0;
                                        correctAnsArr.forEach((correct, i) => {
                                            totalSimilarity += calculateSimilarity(userAnsArr[i] || "", correct);
                                        });
                                        similarity = correctAnsArr.length > 0 ? totalSimilarity / correctAnsArr.length : 0;
                                        isCorrect = similarity >= 0.9;
                                        
                                        userAnsDisplay = Array.isArray(userAnsArr) ? userAnsArr.join(", ") : userAnswerRaw;
                                    } catch {
                                        similarity = calculateSimilarity(userAnswerRaw, q.answer);
                                        isCorrect = similarity >= 0.9;
                                    }
                                } else {
                                    similarity = calculateSimilarity(userAnswerRaw, q.answer);
                                    isCorrect = similarity >= 0.9;
                                }
                            } else {
                                isCorrect = true;
                            }

                            return (
                                <div key={q.id} className="flex flex-col gap-4 rounded-xl border border-secondary bg-primary p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-tertiary"># {idx + 1}</span>
                                            <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-700">
                                                {q.skill}
                                            </span>
                                        </div>
                                        {(isMC || isWriting || q.skill.toLowerCase() === "speaking") && (
                                            <div className={cx(
                                                "flex items-center gap-1.5 text-sm font-medium",
                                                isCorrect ? "text-success-700" : "text-error-700"
                                            )}>
                                                {isCorrect ? <CheckCircle className="size-4" /> : <XCircle className="size-4" />}
                                                {isCorrect ? "Correct" : "Incorrect"}
                                                {(isWriting || q.skill.toLowerCase() === "speaking") && <span className="text-xs text-tertiary ml-1">({Math.round(similarity * 100)}% match)</span>}
                                            </div>
                                        )}
                                    </div>

                                    <Markdown content={q.description} className="text-md font-medium text-primary" />

                                    <div className="flex flex-col gap-2">
                                        <div className="text-sm font-semibold text-secondary">Your Answer:</div>
                                        <div className={cx(
                                            "rounded-lg border p-3 text-sm",
                                            (isMC || isWriting)
                                                ? (isCorrect ? "border-success-200 bg-success-50 text-success-700" : "border-error-200 bg-error-50 text-error-700")
                                                : "border-secondary bg-secondary text-primary"
                                        )}>
                                            {userAnsDisplay ? (
                                                <Markdown content={userAnsDisplay} className="text-sm font-medium" />
                                            ) : (
                                                <span className="italic text-tertiary">Not answered</span>
                                            )}
                                        </div>

                                        {!isCorrect && (isMC || isWriting || q.skill.toLowerCase() === "speaking") && (
                                            <div className="mt-1">
                                                <div className="text-sm font-semibold text-success-700">Correct Answer:</div>
                                                <div className="text-sm text-success-700 font-medium">
                                                    <Markdown content={q.answer.replace(/\|->/g, ", ")} className="text-sm font-medium" />
                                                </div>
                                            </div>
                                        )}

                                        {!isMC && !isWriting && (
                                            <div className="mt-2 rounded-lg bg-brand-soft/10 border border-brand-200 p-4">
                                                <div className="text-sm font-semibold text-brand-700">Evaluation Criteria / Sample Answer:</div>
                                                <Markdown content={q.answer} className="mt-1 text-sm text-brand-700" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

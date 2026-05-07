"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../base/buttons/button";
import { Checkbox } from "../../base/checkbox/checkbox";
import { Input } from "../../base/input/input";
import { Label } from "../../base/input/label";
import { Select } from "../../base/select/select";
import { SkillType, useExamStore } from "../../../store/use-exam-store";

const LANGUAGES = [
    { id: "English", label: "English" },
    { id: "Japanese", label: "Japanese (日本語)" },
    { id: "Korean", label: "Korean (한국어)" },
    { id: "French", label: "French (Français)" },
    { id: "Spanish", label: "Spanish (Español)" },
    { id: "Mandarin", label: "Mandarin (普通话)" },
    { id: "Arabic", label: "Arabic (العربية)" },
    { id: "German", label: "German (Deutsch)" },
    { id: "Italian", label: "Italian (Italiano)" },
    { id: "Portuguese", label: "Portuguese (Português)" },
    { id: "Russian", label: "Russian (Русский)" },
    { id: "Hindi", label: "Hindi (हिन्दी)" },
    { id: "Sundanese", label: "Sundanese (Basa Sunda)" },
    { id: "Javanese", label: "Javanese (Basa Jawa)" },
];

export const ConfigForm = () => {
    const router = useRouter();
    const createNewExam = useExamStore((state) => state.createNewExam);

    const [language, setLanguage] = useState("English");
    const [questionCount, setQuestionCount] = useState(10);
    const [selectedSkills, setSelectedSkills] = useState<SkillType[]>(["Reading"]);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = () => {
        setIsLoading(true);
        try {
            if (questionCount === 0) { setIsLoading(false); return; }
            if (selectedSkills.length === 0) {
                alert("Please select at least one skill.");
                setIsLoading(false);
                return;
            }

            const examId = createNewExam({
                language,
                questionCount,
                skills: selectedSkills,
            });
            router.push(`/playground/${examId}`);
        } catch (e) {
            console.error(e);
            setIsLoading(false);
        }
    };

    const toggleSkill = (skill: SkillType) => {
        setSelectedSkills((prev) =>
            prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
        );
    };

    return (
        <div className="flex w-full max-w-md flex-col gap-8 rounded-2xl border border-secondary bg-primary p-6 shadow-sm">
            <div className="flex flex-col gap-2">
                <h2 className="text-display-xs font-semibold text-primary">Setup Your Vibe Language Exam</h2>
                <p className="text-md text-tertiary">Configure the exam parameters to generate AI-powered questions.</p>
            </div>

            <div className="flex flex-col gap-6">
                {/* Language */}
                <div className="flex flex-col gap-1.5">
                    <Label>Language to Test</Label>
                    <Select
                        selectedKey={language}
                        onSelectionChange={(key) => setLanguage(key as string)}
                        placeholder="Select language"
                    >
                        {LANGUAGES.map((lang) => (
                            <Select.Item key={lang.id} id={lang.id}>{lang.label}</Select.Item>
                        ))}
                    </Select>
                </div>

                {/* Question Count */}
                <div className="flex flex-col gap-1.5">
                    <Label>Number of Questions</Label>
                    <Input
                        type="number"
                        inputMode="numeric"
                        value={questionCount.toString()}
                        onChange={(val: string) => {
                            const num = parseInt(val) || 0;
                            setQuestionCount(Math.max(0, Math.min(100, num)));
                        }}
                        placeholder="E.g. 10"
                        isRequired
                        isInvalid={questionCount === 0}
                        hint={questionCount === 0 ? "Must be more than 0." : undefined}
                    />
                </div>

                {/* Skills */}
                <div className="flex flex-col gap-3">
                    <Label>Skills to Test</Label>
                    <div className="grid grid-cols-2 gap-4">
                        {(["Reading", "Writing", "Speaking", "Listening"] as SkillType[]).map((skill) => (
                            <Checkbox
                                key={skill}
                                label={skill}
                                isSelected={selectedSkills.includes(skill)}
                                onChange={() => toggleSkill(skill)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <Button size="xl" onClick={handleGenerate} disabled={isLoading} isLoading={isLoading} className="w-full">
                Generate Questions
            </Button>
        </div>
    );
};

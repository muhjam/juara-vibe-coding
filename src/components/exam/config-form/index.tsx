"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Input } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import { Select } from "@/components/base/select/select";
import { SkillType, useExamStore } from "@/store/use-exam-store";
import { useConfigStore, DEFAULT_MODELS, AIProvider } from "@/store/use-config-store";
import { ChevronDown, ChevronUp, Settings01, File06, Zap, ShieldTick, Translate01 } from "@untitledui/icons";
import { CustomKeyModal } from "../custom-key-modal";
import { BadgeWithIcon } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";

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

// Status Dot component
const StatusDot = ({ color = "success" }: { color?: "success" | "error" | "warning" }) => (
    <div className={cx(
        "size-2 rounded-full",
        color === "success" ? "bg-success-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" :
            color === "warning" ? "bg-warning-500 shadow-[0_0_8px_rgba(247,144,9,0.6)]" :
                "bg-error-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
    )} />
);

export const ConfigForm = () => {
    const router = useRouter();
    const createExamAction = useExamStore((state) => state.createNewExam);

    const {
        provider, setProvider,
        modelName, setModelName,
        customApiKeys,
        usePersonalKey, setUsePersonalKey,
        connectionStatuses, updateStatus
    } = useConfigStore();

    const [language, setLanguage] = useState("English");
    const [questionCount, setQuestionCount] = useState(10);
    const [selectedSkills, setSelectedSkills] = useState<SkillType[]>(["Reading"]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Initial status check
    useEffect(() => {
        updateStatus("groq");
        updateStatus("gemini");
        updateStatus("openai");
        updateStatus("anthropic");
    }, []);

    const handleGenerate = () => {
        setIsLoading(true);
        try {
            if (questionCount === 0) { setIsLoading(false); return; }
            if (selectedSkills.length === 0) {
                setIsLoading(false);
                return;
            }

            const examId = createExamAction({
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

    const models = DEFAULT_MODELS[provider] || [];

    const PROVIDERS: { id: AIProvider; label: string }[] = [
        { id: "groq", label: "Groq (Fastest)" },
        { id: "gemini", label: "Google Gemini" },
        { id: "openai", label: "OpenAI (GPT)" },
        { id: "anthropic", label: "Anthropic (Claude)" },
    ];

    const currentStatus = connectionStatuses[provider];
    const dotColor = currentStatus === "connected" ? "success" : currentStatus === "no-quota" ? "warning" : "error";
    
    // Check if the current provider has a custom key
    const hasActiveCustomKey = !!customApiKeys[provider];

    return (
        <div className="flex w-full md:max-w-md md:mx-auto flex-col gap-8 rounded-2xl border border-secondary bg-primary p-6 shadow-sm">
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-display-xs font-semibold text-primary">Setup Your Exam</h2>
                    {hasActiveCustomKey && usePersonalKey && (
                        <BadgeWithIcon color="success" iconLeading={ShieldTick}>BYOK Active</BadgeWithIcon>
                    )}
                </div>
                <p className="text-md text-tertiary">Configure the parameters to generate AI-powered questions.</p>
            </div>

            <div className="flex flex-col gap-6">
                {/* Language */}
                <div className="flex flex-col gap-1.5">
                    <Label>Language to Test</Label>
                    <Select
                        selectedKey={language}
                        onSelectionChange={(key) => setLanguage(key as string)}
                        placeholder="Select language"
                        placeholderIcon={Translate01}
                    >
                        {LANGUAGES.map((lang) => (
                            <Select.Item key={lang.id} id={lang.id} label={lang.label}>{lang.label}</Select.Item>
                        ))}
                    </Select>
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
                        icon={File06}
                    />
                </div>

                {/* Advanced Toggle */}
                <div className="border-t border-secondary pt-4">
                    <button
                        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                        className="flex w-full items-center justify-between text-sm font-semibold text-brand-700 hover:text-brand-800"
                    >
                        <div className="flex items-center gap-2">
                            <Settings01 className="size-4" />
                            <span>Advanced AI Settings</span>
                        </div>
                        {isAdvancedOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </button>

                    {isAdvancedOpen && (
                        <div className="mt-6 flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-300">

                            {/* Provider */}
                            <div className="flex flex-col gap-1.5">
                                <Label>AI Provider</Label>
                                <Select
                                    selectedKey={provider}
                                    onSelectionChange={(key) => {
                                        const newProvider = key as AIProvider;
                                        setProvider(newProvider);
                                        const firstModel = DEFAULT_MODELS[newProvider]?.[0]?.id;
                                        if (firstModel) setModelName(firstModel);
                                    }}
                                    placeholderIcon={<StatusDot color={dotColor} />}
                                >
                                    {PROVIDERS.map((p) => {
                                        const status = connectionStatuses[p.id];
                                        const pDotColor = status === "connected" ? "success" : status === "no-quota" ? "warning" : "error";

                                        return (
                                            <Select.Item
                                                key={p.id}
                                                id={p.id}
                                                label={p.label}
                                                icon={<StatusDot color={pDotColor} />}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <span>{p.label}</span>
                                                    {status === "disconnected" && <span className="text-[10px] font-medium text-error-600">Disconnected</span>}
                                                    {status === "no-quota" && <span className="text-[10px] font-medium text-error-600">No Quota</span>}
                                                </div>
                                            </Select.Item>
                                        );
                                    })}
                                </Select>
                            </div>

                            {/* Model */}
                            <div className="flex flex-col gap-1.5">
                                <Label>Model Name</Label>
                                <Select
                                    selectedKey={modelName}
                                    onSelectionChange={(key) => setModelName(key as string)}
                                    placeholderIcon={<StatusDot color={dotColor} />}
                                >
                                    {models.map((m) => (
                                        <Select.Item
                                            key={m.id}
                                            id={m.id}
                                            label={m.name}
                                            icon={<StatusDot color={dotColor} />}
                                        >
                                            {m.name}
                                        </Select.Item>
                                    ))}
                                </Select>
                            </div>

                            {/* Key Toggle - Only if custom API key exists for CURRENT provider */}
                            {hasActiveCustomKey && (
                                <div className="flex items-center justify-between rounded-lg border border-success-200 bg-success-25 p-3">
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-sm font-semibold text-success-800">Use Personal {provider.toUpperCase()} Key</p>
                                        <p className="text-xs text-success-600">Bypass global usage limits.</p>
                                    </div>
                                    <Checkbox
                                        isSelected={usePersonalKey}
                                        onChange={setUsePersonalKey}
                                    />
                                </div>
                            )}

                            <Button
                                color="secondary"
                                size="sm"
                                iconLeading={Zap}
                                onClick={() => setIsModalOpen(true)}
                            >
                                {hasActiveCustomKey ? `Manage / Change ${provider.toUpperCase()} Key` : `Use Custom ${provider.toUpperCase()} Key`}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <Button size="xl" onClick={handleGenerate} disabled={isLoading} isLoading={isLoading} className="w-full">
                Generate Exam
            </Button>

            <CustomKeyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                provider={provider}
            />
        </div>
    );
};

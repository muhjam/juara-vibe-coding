"use client";

import React, { useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { Slider } from "@/components/base/slider/slider";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Card } from "@/components/base/card";
import { useRouter } from "next/navigation";

export const LandingForm = () => {
    const router = useRouter();
    const [config, setConfig] = useState({
        language: "English",
        questionCount: 10,
        skills: ["Reading", "Writing", "Listening", "Speaking"],
        difficulty: "Intermediate",
        type: "Multiple Choice"
    });

    const handleStart = () => {
        localStorage.setItem("lang-test-config", JSON.stringify(config));
        router.push("/playground");
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <Card className="p-8 space-y-8 bg-white shadow-xl rounded-2xl border border-slate-200">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900">Uji Kemampuan Bahasa</h1>
                    <p className="text-slate-500">Konfigurasi tes Anda dan mulai latihan sekarang.</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Bahasa yang ingin diuji</label>
                        <Select 
                            selectedKey={config.language} 
                            onSelectionChange={(key) => setConfig({ ...config, language: key as string })}
                        >
                            <Select.Item id="English">English</Select.Item>
                            <Select.Item id="Japanese">Japanese</Select.Item>
                            <Select.Item id="Korean">Korean</Select.Item>
                            <Select.Item id="French">French</Select.Item>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Skill yang akan diuji</label>
                        <div className="grid grid-cols-2 gap-4">
                            {["Reading", "Writing", "Listening", "Speaking"].map((skill) => (
                                <Checkbox 
                                    key={skill}
                                    isSelected={config.skills.includes(skill)}
                                    onChange={(isSelected) => {
                                        const newSkills = isSelected 
                                            ? [...config.skills, skill]
                                            : config.skills.filter(s => s !== skill);
                                        setConfig({ ...config, skills: newSkills });
                                    }}
                                    label={skill}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <label className="text-sm font-medium text-slate-700">Jumlah Soal</label>
                            <span className="text-sm font-bold text-slate-900">{config.questionCount} Soal</span>
                        </div>
                        <Slider 
                            value={config.questionCount} 
                            onChange={(val) => setConfig({ ...config, questionCount: val as number })}
                            minValue={1}
                            maxValue={50}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Tipe Soal</label>
                        <Select 
                            selectedKey={config.type} 
                            onSelectionChange={(key) => setConfig({ ...config, type: key as string })}
                        >
                            <Select.Item id="Multiple Choice">Multiple Choice</Select.Item>
                            <Select.Item id="Essay">Essay</Select.Item>
                        </Select>
                    </div>

                    <Button 
                        size="lg" 
                        className="w-full bg-slate-900 text-white hover:bg-slate-800 transition-all"
                        onClick={handleStart}
                    >
                        Mulai Tes Sekarang
                    </Button>
                </div>
            </Card>
        </div>
    );
};

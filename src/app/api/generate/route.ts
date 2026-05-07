import { NextRequest, NextResponse } from "next/server";
import { Question, SkillType } from "@/store/use-exam-store";
import { SYSTEM_PROMPT } from "@/utils/ai-prompts";
import { FINE_TUNE_EXAMPLES } from "@/utils/ai-examples";
import {
    AI_PROVIDER,
    AI_MODEL_NAME,
    GEMINI_API_KEY,
    GROQ_API_KEY,
    OPENAI_API_KEY,
    ANTHROPIC_API_KEY
} from "@/config";

async function callGemini(prompt: string): Promise<string> {
    const apiKey = GEMINI_API_KEY;
    const model = AI_MODEL_NAME;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

    // Format Gemini messages: System is usually part of the first user message or separate instructions
    // Here we use the standard contents array
    const contents = [
        ...FINE_TUNE_EXAMPLES.map(ex => ({
            role: ex.role === "assistant" ? "model" : "user",
            parts: [{ text: ex.content }]
        })),
        { role: "user", parts: [{ text: prompt }] }
    ];

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
                contents
            }),
        }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Gemini API error");
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callGroq(prompt: string): Promise<string> {
    const apiKey = GROQ_API_KEY;
    const model = AI_MODEL_NAME;
    if (!apiKey) throw new Error("GROQ_API_KEY is not set");

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...FINE_TUNE_EXAMPLES,
                { role: "user", content: prompt },
            ],
            temperature: 1.1,
        }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Groq API error");
    return data.choices?.[0]?.message?.content || "";
}

async function callOpenAI(prompt: string): Promise<string> {
    const apiKey = OPENAI_API_KEY;
    const model = AI_MODEL_NAME;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...FINE_TUNE_EXAMPLES,
                { role: "user", content: prompt },
            ],
        }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "OpenAI API error");
    return data.choices?.[0]?.message?.content || "";
}

async function callAnthropic(prompt: string): Promise<string> {
    const apiKey = ANTHROPIC_API_KEY;
    const model = AI_MODEL_NAME;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model,
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages: [
                ...FINE_TUNE_EXAMPLES,
                { role: "user", content: prompt }
            ],
        }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Anthropic API error");
    return data.content?.[0]?.text || "";
}

function parseCSV(raw: string, defaultSkill: SkillType): Question[] {
    console.log("[groq] Raw response:", raw);
    const cleanRaw = raw.replace(/```[a-z]*\n?/gi, "").replace(/```/g, "").trim();
    let rows = cleanRaw.split("<_>").filter((r) => r.trim().length > 0);
    if (rows.length === 0 && cleanRaw.includes("|->")) {
        rows = [cleanRaw];
    }

    const questions: Question[] = [];
    rows.forEach((row) => {
        if (!row.includes("|->")) return;
        const parts = row.split("|->").map((p) => p.trim()).filter(p => p !== "");

        let description = parts[0] || "No description provided by AI.";
        let optionsStr = "null";
        let answer = "No sample answer provided.";
        let skill = defaultSkill;

        if (parts.length >= 4) {
            optionsStr = parts[1];
            answer = parts[2];
            skill = (parts[3] || defaultSkill) as SkillType;
        } else if (parts.length >= 2) {
            answer = parts[1];
            if (parts.length >= 3) skill = parts[2] as SkillType;
        }

        let options: string[] | null = null;
        if (optionsStr && optionsStr.toLowerCase() !== "null" && optionsStr !== "[]") {
            try {
                options = JSON.parse(optionsStr.replace(/'/g, '"'));
            } catch {
                const matches = optionsStr.match(/'([^']+)'/g);
                options = matches ? matches.map((m) => m.slice(1, -1)) : optionsStr.replace(/[\[\]']/g, "").split(",").map((o) => o.trim()).filter(Boolean);
            }
        }

        questions.push({ id: crypto.randomUUID(), description, options: options && options.length > 0 ? options : null, answer, skill });
    });
    return questions;
}

export async function POST(req: NextRequest) {
    try {
        const { range, skill, language } = await req.json();
        if (!range || !skill) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const userPrompt = `question number ${range}, ['${skill}']${language ? ` for ${language} language` : ""}`;
        let rawResponse = "";

        switch (AI_PROVIDER) {
            case "gemini": rawResponse = await callGemini(userPrompt); break;
            case "groq": rawResponse = await callGroq(userPrompt); break;
            case "openai": rawResponse = await callOpenAI(userPrompt); break;
            case "anthropic": rawResponse = await callAnthropic(userPrompt); break;
            default: rawResponse = await callGemini(userPrompt); break;
        }

        console.log(`[${AI_PROVIDER}] Raw response:`, rawResponse);
        const questions = parseCSV(rawResponse, skill as SkillType);
        return NextResponse.json({ questions, raw: rawResponse });
    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

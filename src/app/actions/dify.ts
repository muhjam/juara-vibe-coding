"use server";

import { Question, QuestionType, SkillType } from "@/store/use-exam-store";

const DIFY_HOST = process.env.NEXT_PUBLIC_DIFY_HOST;
const DIFY_API_KEY = process.env.NEXT_PUBLIC_DIFY_EXAMS_QUESTIONS_GENERATOR_TOKEN;

export async function generateQuestionsChunk(range: string, skill: string, type: string) {
    if (!DIFY_HOST || !DIFY_API_KEY) {
        throw new Error("Dify configuration is missing");
    }

    const prompt = `${range}, ${skill}, ${type}`;

    try {
        const response = await fetch(`${DIFY_HOST}/workflows/run`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${DIFY_API_KEY}`,
            },
            body: JSON.stringify({
                inputs: {
                    query: prompt,
                    input: prompt,
                    text: prompt,
                    prompt: prompt,
                },
                response_mode: "blocking",
                user: "user-" + Math.random().toString(36).substring(7),
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Dify Error Response:", error);
            throw new Error(`Dify API error: ${error}`);
        }

        const data = await response.json();

        // Workflow responses normally nest outputs in data.outputs
        // But user provided example shows { "result": "..." }
        let resultString = data.result || "";

        if (!resultString && data.data?.outputs) {
            resultString = data.data.outputs.result || data.data.outputs.text || "";
        }

        if (!resultString && data.answer) {
            resultString = data.answer;
        }

        return parseDifyCSV(resultString);
    } catch (error) {
        console.error("Error generating questions:", error);
        throw error;
    }
}

function parseDifyCSV(raw: string): Question[] {
    // Split by question separator <_>
    const rows = raw.split("<_>").filter((row) => row.trim().length > 0);
    const questions: Question[] = [];

    rows.forEach((row, index) => {
        // Split by field separator |->
        // Rule: description |-> options |-> answer |-> skill |-> type
        const parts = row.split("|->").map((p) => p.trim());

        if (parts.length < 4) {
            console.warn(`Row ${index} has insufficient fields: ${row}`);
            return;
        }

        // If part length is 4, it might be the user's "3 separators" case
        // But the rule says 4 separators (5 fields).
        // Let's handle both gracefully if possible.

        let description = "";
        let optionsStr = "";
        let answer = "";
        let skillStr = "";
        let typeStr = "";

        if (parts.length === 5) {
            [description, optionsStr, answer, skillStr, typeStr] = parts;
        } else if (parts.length === 4) {
            // Handle the case from the example: description+options merged or missing separator
            // If parts[0] contains a bracket-like structure, maybe it's combined.
            // But let's stick to the 5 fields rule mostly.
            [description, answer, skillStr, typeStr] = parts;
            // If it's Multiple Choice, we might need to extract options from description if they were merged
            if (description.includes("[") && description.includes("]")) {
                const match = description.match(/\[.*\]/);
                if (match) {
                    optionsStr = match[0];
                    description = description.replace(optionsStr, "").trim();
                }
            }
        }

        const type = (typeStr || "Multiple Choice") as QuestionType;
        const skill = (skillStr || "Reading") as SkillType;

        let options: string[] | null = null;
        if (type === "Multiple Choice") {
            try {
                // Parse ['A','B','C','D']
                // Replace single quotes with double quotes for JSON.parse
                const sanitized = optionsStr.replace(/'/g, '"');
                options = JSON.parse(sanitized);
            } catch (e) {
                console.error("Error parsing options:", optionsStr);
                // Fallback attempt to split if JSON parse fails
                options = optionsStr
                    .replace(/[\[\]']/g, "")
                    .split(",")
                    .map((o) => o.trim());
            }
        }

        questions.push({
            id: crypto.randomUUID(),
            description,
            options,
            answer,
            skill,
            type,
        });
    });

    return questions;
}

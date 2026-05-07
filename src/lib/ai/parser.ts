import { Question, SkillType } from "@/store/use-exam-store";
export type { Question, SkillType };

export const parseAIResponse = (raw: string): Question[] => {
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
        let skill: SkillType = "Reading";

        if (parts.length >= 4) {
            optionsStr = parts[1];
            answer = parts[2];
            skill = (parts[3] || "Reading") as SkillType;
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
};

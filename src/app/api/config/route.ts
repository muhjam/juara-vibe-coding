import { NextResponse } from "next/server";
import { AI_PROVIDER, AI_MODEL_NAME } from "@/config";

export async function GET() {
    return NextResponse.json({
        provider: AI_PROVIDER || "groq",
        modelName: AI_MODEL_NAME || "llama-3.3-70b-versatile",
    });
}

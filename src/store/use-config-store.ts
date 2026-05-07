import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AI_PROVIDER, AI_MODEL_NAME } from "@/config";
import { checkAIProviderStatus, ProviderStatus } from "@/actions/ai-status";

export type AIProvider = "gemini" | "groq" | "openai" | "anthropic" | "custom";

interface AIModel {
    id: string;
    name: string;
    provider: AIProvider;
}

interface ConfigState {
    provider: AIProvider;
    modelName: string;
    customApiKeys: Record<AIProvider, string | null>;
    usePersonalKey: boolean;
    
    // Real connection status from server
    connectionStatuses: Record<AIProvider, ProviderStatus>;
    
    // Actions
    setProvider: (provider: AIProvider) => void;
    setModelName: (modelName: string) => void;
    setCustomApiKey: (provider: AIProvider, key: string | null) => void;
    disconnectCustomKey: (provider: AIProvider) => void;
    setUsePersonalKey: (use: boolean) => void;
    updateStatus: (provider: AIProvider) => Promise<void>;
    useTokens: (amount: number) => void; 
}

export const useConfigStore = create<ConfigState>()(
    persist(
        (set, get) => ({
            provider: (AI_PROVIDER as AIProvider) || "groq",
            modelName: AI_MODEL_NAME || "llama-3.3-70b-versatile",
            customApiKeys: {
                gemini: null,
                groq: null,
                openai: null,
                anthropic: null,
                custom: null,
            },
            usePersonalKey: false,
            connectionStatuses: {
                gemini: "disconnected",
                groq: "disconnected",
                openai: "disconnected",
                anthropic: "disconnected",
                custom: "disconnected",
            },

            setProvider: (provider) => {
                set({ provider });
                get().updateStatus(provider);
            },
            setModelName: (modelName) => set({ modelName }),
            setCustomApiKey: (p, key) => {
                set((state) => ({
                    customApiKeys: {
                        ...state.customApiKeys,
                        [p]: key
                    },
                    // If we set a key for the current provider, enable personal key mode
                    usePersonalKey: p === get().provider ? !!key : state.usePersonalKey
                }));
                get().updateStatus(p);
            },
            disconnectCustomKey: (p) => {
                set((state) => ({
                    customApiKeys: {
                        ...state.customApiKeys,
                        [p]: null
                    },
                    usePersonalKey: p === get().provider ? false : state.usePersonalKey
                }));
                get().updateStatus(p);
            },
            setUsePersonalKey: (usePersonalKey) => set({ usePersonalKey }),
            
            updateStatus: async (p) => {
                const state = get();
                const customKey = state.customApiKeys[p];
                const status = await checkAIProviderStatus(p, customKey);
                set((state) => ({
                    connectionStatuses: {
                        ...state.connectionStatuses,
                        [p]: status
                    }
                }));
            },

            useTokens: () => {}
        }),
        {
            name: "vibe-config-storage",
        }
    )
);

export const DEFAULT_MODELS: Record<AIProvider, AIModel[]> = {
    groq: [
        { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", provider: "groq" },
        { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B", provider: "groq" },
        { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", provider: "groq" },
    ],
    gemini: [
        { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "gemini" },
        { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "gemini" },
    ],
    openai: [
        { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai" },
        { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
    ],
    anthropic: [
        { id: "claude-3-5-sonnet-latest", name: "Claude 3.5 Sonnet", provider: "anthropic" },
    ],
    custom: []
};

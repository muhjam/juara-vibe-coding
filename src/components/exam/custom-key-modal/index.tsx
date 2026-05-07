"use client";

import { useState, useEffect } from "react";
import { useConfigStore, AIProvider } from "@/store/use-config-store";
import { Modal } from "@/components/shared-assets/modal";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { Key01, CheckCircle, Trash01, ArrowUpRight } from "@untitledui/icons";
import { useToast } from "@/contexts/use-toast";

interface CustomKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    provider: AIProvider;
}

const PROVIDER_LINKS: Record<string, string> = {
    groq: "https://console.groq.com/keys",
    gemini: "https://aistudio.google.com/app/apikey",
    openai: "https://platform.openai.com/api-keys",
    anthropic: "https://console.anthropic.com/settings/keys",
};

export const CustomKeyModal = ({ isOpen, onClose, provider }: CustomKeyModalProps) => {
    const { customApiKeys, setCustomApiKey, disconnectCustomKey } = useConfigStore();
    const { toastSuccess, toastError } = useToast();
    
    const activeKey = customApiKeys[provider];
    const [tempKey, setTempKey] = useState(activeKey || "");
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        setTempKey(customApiKeys[provider] || "");
    }, [provider, customApiKeys, isOpen]);

    const handleConnect = async () => {
        if (!tempKey.trim()) {
            toastError("Please enter a valid API Key", "Input Error");
            return;
        }

        setIsConnecting(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        setCustomApiKey(provider, tempKey);
        setIsConnecting(false);
        toastSuccess(`API Key updated for ${provider.toUpperCase()}!`, "Connected");
        onClose();
    };

    const handleDisconnect = () => {
        disconnectCustomKey(provider);
        toastSuccess(`Personal API Key for ${provider.toUpperCase()} removed.`, "Disconnected");
        onClose();
    };

    const hasKey = !!activeKey;
    const docLink = PROVIDER_LINKS[provider];

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={(open) => !open && onClose()}
            title={hasKey ? `Manage ${provider.toUpperCase()} Key` : `Connect Your ${provider.toUpperCase()} Key`}
            description="Your key is stored locally in your browser and never sent to our servers."
            icon={Key01}
            iconTheme="modern"
            maxWidth="md"
            primaryAction={{
                label: hasKey ? "Save Changes" : "Connect Key",
                onClick: handleConnect,
                isLoading: isConnecting
            }}
            secondaryAction={{
                label: "Cancel",
                onClick: onClose
            }}
        >
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-secondary">{provider.toUpperCase()} API Key</label>
                            {docLink && (
                                <a 
                                    href={docLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
                                >
                                    Get your key <ArrowUpRight className="size-3" />
                                </a>
                            )}
                        </div>
                        <Input
                            placeholder={`Paste your ${provider} API key here...`}
                            value={tempKey}
                            onChange={setTempKey}
                            icon={Key01}
                            type="password"
                        />
                    </div>

                    {hasKey && (
                        <Button 
                            color="tertiary-destructive" 
                            size="sm" 
                            iconLeading={Trash01}
                            onClick={handleDisconnect}
                            className="w-fit"
                        >
                            Disconnect & Remove Key
                        </Button>
                    )}
                </div>

                <div className="flex flex-col gap-2 rounded-lg bg-brand-soft/10 p-3 text-xs text-brand-700 border border-brand-200">
                    <div className="flex items-center gap-1.5 font-semibold">
                        <CheckCircle className="size-3.5" />
                        <span>Why use your own key?</span>
                    </div>
                    <p>Using your own key for {provider} gives you unlimited generations and access to your own account's quota/tier.</p>
                </div>
            </div>
        </Modal>
    );
};

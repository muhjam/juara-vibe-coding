"use client";

import { useState, useEffect } from "react";
import { useConfigStore, AIProvider } from "@/store/use-config-store";
import { Modal } from "@/components/shared-assets/modal";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { Key01, CheckCircle, Trash01 } from "@untitledui/icons";
import { toast } from "sonner";

interface CustomKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    provider: AIProvider;
}

export const CustomKeyModal = ({ isOpen, onClose, provider }: CustomKeyModalProps) => {
    const { customApiKeys, setCustomApiKey, disconnectCustomKey } = useConfigStore();
    
    const activeKey = customApiKeys[provider];
    const [tempKey, setTempKey] = useState(activeKey || "");
    const [isConnecting, setIsConnecting] = useState(false);

    // Sync tempKey when provider or customApiKeys changes
    useEffect(() => {
        setTempKey(customApiKeys[provider] || "");
    }, [provider, customApiKeys, isOpen]);

    const handleConnect = async () => {
        if (!tempKey.trim()) {
            toast.error("Please enter a valid API Key");
            return;
        }

        setIsConnecting(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        setCustomApiKey(provider, tempKey);
        setIsConnecting(false);
        toast.success(`API Key updated for ${provider.toUpperCase()}!`);
        onClose();
    };

    const handleDisconnect = () => {
        disconnectCustomKey(provider);
        toast.success(`Personal API Key for ${provider.toUpperCase()} removed.`);
        onClose();
    };

    const hasKey = !!activeKey;

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
                    <Input
                        label={`${provider.toUpperCase()} API Key`}
                        placeholder={`Paste your ${provider} API key here...`}
                        value={tempKey}
                        onChange={setTempKey}
                        icon={Key01}
                        type="password"
                    />

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

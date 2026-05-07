"use client";

import { useConfigStore } from "@/store/use-config-store";
import { ShieldTick, Zap, Globe01, AlertTriangle } from "@untitledui/icons";
import { cx } from "@/utils/cx";

export const GlobalTokenBar = () => {
    const { connectionStatuses, provider, customApiKeys, usePersonalKey } = useConfigStore();
    
    const status = connectionStatuses[provider];
    const hasPersonalKey = !!customApiKeys[provider];
    const isUsingPersonal = hasPersonalKey && usePersonalKey;

    const getStatusConfig = () => {
        if (status === "connected") {
            return {
                label: isUsingPersonal ? `${provider.toUpperCase()} Personal Active` : `${provider.toUpperCase()} Global Active`,
                sub: isUsingPersonal ? "Using your own API key." : "Using system-provided API key.",
                color: "success",
                icon: isUsingPersonal ? ShieldTick : Globe01
            };
        }
        if (status === "no-quota") {
            return {
                label: "Quota Exhausted",
                sub: `Your ${provider.toUpperCase()} quota is empty. Please check billing.`,
                color: "warning",
                icon: AlertTriangle
            };
        }
        return {
            label: "Disconnected",
            sub: `No valid API key found for ${provider.toUpperCase()}.`,
            color: "error",
            icon: Zap
        };
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <div className={cx(
            "flex w-full md:max-w-md md:mx-auto flex-col gap-1 rounded-xl border p-3 shadow-xs backdrop-blur-sm transition-all duration-300",
            config.color === "success" ? "border-success-200 bg-success-25/50" :
                config.color === "warning" ? "border-warning-200 bg-warning-25/50" :
                    "border-error-200 bg-error-25/50"
        )}>
            <div className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-1.5">
                    <Icon className={cx(
                        "size-3.5",
                        config.color === "success" ? "text-success-600" :
                            config.color === "warning" ? "text-warning-600" :
                                "text-error-600"
                    )} />
                    <span className={cx(
                        "capitalize font-bold",
                        config.color === "success" ? "text-success-700" :
                            config.color === "warning" ? "text-warning-700" :
                                "text-error-700"
                    )}>
                        {config.label}
                    </span>
                </div>

                <div className="flex items-center gap-1.5">
                    <div className={cx(
                        "size-2 rounded-full",
                        config.color === "success" ? "bg-success-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" :
                            config.color === "warning" ? "bg-warning-500 shadow-[0_0_8px_rgba(247,144,9,0.6)]" :
                                "bg-error-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                    )} />
                </div>
            </div>

            <p className="text-[10px] text-tertiary">
                {config.sub}
            </p>
        </div>
    );
};

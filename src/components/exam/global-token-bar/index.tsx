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
            "flex w-full md:max-w-md md:mx-auto flex-col gap-1 rounded-xl border p-3 shadow-xs backdrop-blur-md transition-all duration-300",
            // Border & BG logic
            config.color === "success" ? "border-success-200 bg-success-25/50 dark:border-success-500/30 dark:bg-success-500/5" :
                config.color === "warning" ? "border-warning-200 bg-warning-25/50 dark:border-warning-500/30 dark:bg-warning-500/5" :
                    "border-error-200 bg-error-25/50 dark:border-error-500/30 dark:bg-error-500/5"
        )}>
            <div className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-1.5">
                    <Icon className={cx(
                        "size-3.5",
                        config.color === "success" ? "text-success-600 dark:text-success-400" :
                            config.color === "warning" ? "text-warning-600 dark:text-warning-400" :
                                "text-error-600 dark:text-error-400"
                    )} />
                    <span className={cx(
                        "capitalize font-bold",
                        config.color === "success" ? "text-success-700 dark:text-success-300" :
                            config.color === "warning" ? "text-warning-700 dark:text-warning-300" :
                                "text-error-700 dark:text-error-300"
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

            <p className="text-[10px] text-tertiary dark:text-secondary-dark">
                {config.sub}
            </p>
        </div>
    );
};

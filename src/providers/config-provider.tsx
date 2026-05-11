"use client";

import { useEffect } from "react";
import { useConfigStore } from "@/store/use-config-store";

export function ConfigProvider({ children }: { children: React.ReactNode }) {
    const syncRuntimeConfig = useConfigStore((state) => state.syncRuntimeConfig);

    useEffect(() => {
        // Sync config with server on initial mount
        // This ensures runtime env vars from Code Runner take precedence
        syncRuntimeConfig();
    }, [syncRuntimeConfig]);

    return <>{children}</>;
}

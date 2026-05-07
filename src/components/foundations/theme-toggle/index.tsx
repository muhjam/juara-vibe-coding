"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon01, Sun } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";

export const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <Button size="sm" color="secondary" iconLeading={Moon01} />;
    }

    return (
        <Button
            size="sm"
            color="secondary"
            iconLeading={theme === "dark" ? Sun : Moon01}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
        />
    );
};

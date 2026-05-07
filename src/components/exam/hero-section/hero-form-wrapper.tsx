"use client";

import { GlobalTokenBar } from "../global-token-bar";
import { ConfigForm } from "../config-form";

export const HeroFormWrapper = () => {
    return (
        <div id="setup-exam" className="z-10 w-full lg:max-w-md flex flex-col gap-4 w-full justify-center">
            <GlobalTokenBar />
            <ConfigForm />
        </div>
    );
};

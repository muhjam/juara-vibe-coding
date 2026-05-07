"use client";

import { HeroContent } from "./hero-content";
import { HeroFormWrapper } from "./hero-form-wrapper";

export const HeroSection = () => {
    return (
        <section className="mx-auto flex w-full max-w-container flex-col items-center justify-center gap-12 lg:flex-row lg:items-start lg:justify-between lg:px-8 lg:py-4 px-4 py-16">
            <HeroContent />
            <HeroFormWrapper />
        </section>
    );
};

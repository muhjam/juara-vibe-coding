"use client";

import { BookOpen01, Zap, PlayCircle } from "@untitledui/icons";
import { FeaturedIcon } from "../../foundations/featured-icon/featured-icon";
import { Button } from "@/components/base/buttons/button";

export const HeroContent = () => {
    return (
        <div className="flex max-w-xl flex-col gap-6 text-center lg:sticky lg:top-4 lg:self-start lg:text-left">
            <div className="flex justify-center lg:justify-start">
                <FeaturedIcon icon={Zap} color="brand" theme="light" size="lg" />
            </div>

            <div className="flex flex-col gap-4">
                <h1 className="text-display-md font-semibold text-primary lg:text-display-lg">
                    Master Any Language with AI-Powered Testing
                </h1>
                <p className="text-lg text-tertiary lg:text-xl">
                    Generate personalized exams in seconds. Practice Reading, Writing, Speaking, and Listening in 14+ languages with always-unique questions ensuring you never encounter the same test twice.
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
                <div className="flex items-center gap-2 rounded-full border border-secondary bg-primary px-3 py-1 text-sm font-medium text-secondary">
                    <BookOpen01 className="size-4" />
                    <span>Learn faster</span>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-secondary bg-primary px-3 py-1 text-sm font-medium text-secondary">
                    <Zap className="size-4" />
                    <span>AI Generated</span>
                </div>
            </div>

            <Button
                className="w-fit mx-auto px-12 lg:hidden"
                iconLeading={PlayCircle}
                onClick={() => document.getElementById("setup-exam")?.scrollIntoView({ behavior: "smooth" })}
            >
                Start
            </Button>
        </div>
    );
};

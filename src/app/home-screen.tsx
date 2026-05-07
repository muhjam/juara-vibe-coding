"use client";

import { useExamStore } from "../store/use-exam-store";
import { ThemeToggle } from "../components/foundations/theme-toggle";
import { UntitledLogoMinimal } from "../components/foundations/logo/untitledui-logo-minimal";
import { Badge } from "../components/base/badges/badges";
import { HeroSection } from "../components/exam/hero-section";
import { ExamHistory } from "../components/exam/exam-history";

export const HomeScreen = () => {
    const exams = useExamStore((state) => state.exams);

    return (
        <div className="flex min-h-dvh flex-col bg-primary relative">
            {/* Background decorative elements - Moved overflow-hidden here locally if needed */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                <div className="absolute -top-[10%] -left-[10%] size-[40%] rounded-full bg-brand-soft/20 blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] size-[40%] rounded-full bg-brand-soft/20 blur-[120px]" />
            </div>

            <header className="relative mx-auto flex w-full max-w-container items-center justify-between px-4 py-6 md:px-8">
                <div className="flex items-center gap-2">
                    <UntitledLogoMinimal className="size-8" />
                    <span className="text-xl font-bold text-primary">Vibe Language</span>
                    <Badge color="success">Beta</Badge>
                </div>
                <ThemeToggle />
            </header>

            <main className="relative flex flex-1 flex-col items-center">
                <HeroSection />

                {/* History Section */}
                {exams.length > 0 && (
                    <section className="mx-auto w-full max-w-container px-4 py-16 flex flex-col items-center md:px-8 bg-secondary/30 rounded-3xl mb-20">
                        <ExamHistory />
                    </section>
                )}
            </main>

            <footer className="mx-auto w-full max-w-container px-4 py-8 md:px-8">
                <p className="text-center text-sm text-tertiary">
                    &copy; 2026 Vibe Language by <a href="https://github.com/muhjam" target="_blank" className="hover:underline">Jamjam</a>. Developed with Antigravity.
                </p>
            </footer>
        </div>
    );
};

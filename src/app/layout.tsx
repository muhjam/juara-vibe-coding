import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { RouteProvider } from "../providers/router-provider";
import { Theme } from "../providers/theme";
import "../styles/globals.css";
import { cx } from "../utils/cx";
import { Toaster } from "../components/application/notifications/toaster";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Lingua AI — AI-Powered Multilingual Proficiency Testing",
    description: "Empower your language learning with Lingua AI. Generate personalized proficiency tests for Reading, Writing, Speaking, and Listening in 12+ languages using advanced AI technology. Track your progress and master any language for free.",
    icons: {
        icon: "/logo.png",
    },
};

export const viewport: Viewport = {
    themeColor: "#7f56d9",
    colorScheme: "light dark",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={cx(inter.variable, "bg-primary antialiased")}>
                <RouteProvider>
                    <Theme>
                        {children}
                        <Toaster />
                    </Theme>
                </RouteProvider>
            </body>
        </html>
    );
}

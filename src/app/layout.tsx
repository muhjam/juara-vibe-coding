import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { RouteProvider } from "../providers/router-provider";
import { Theme } from "../providers/theme";
import "../styles/globals.css";
import { cx } from "../utils/cx";
import { ToastProvider } from "../contexts/use-toast";
import { GlobalToast } from "../components/application/notifications/global-toast";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Vibe Language by Jamjam | AI-Powered Multilingual Proficiency Testing",
    description: "Empower your language learning with Vibe Language. Generate personalized, always-unique proficiency tests for Reading, Writing, Speaking, and Listening in 14+ languages. Practice with fresh content every time and master any language for free.",
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
                        <ToastProvider>
                            {children}
                            <GlobalToast />
                        </ToastProvider>
                    </Theme>
                </RouteProvider>
            </body>
        </html>
    );
}

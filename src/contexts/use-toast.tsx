"use client";

import React, { createContext, useContext, useCallback, useState, ReactNode } from "react";

export interface ToastState {
    show: boolean;
    type: "success" | "error" | "warning";
    title: string;
    message: string;
    widthClass?: string;
}

interface ToastContextType {
    toast: ToastState;
    toastSuccess: (message: string, title?: string, options?: { duration?: number; widthClass?: string }) => void;
    toastError: (message: string, title?: string, options?: { duration?: number; widthClass?: string }) => void;
    toastWarning: (message: string, title?: string, options?: { duration?: number; widthClass?: string }) => void;
    closeToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toast, setToast] = useState<ToastState>({
        show: false,
        type: "success",
        title: "",
        message: "",
    });

    const showToast = useCallback((type: "success" | "error" | "warning", options: { title: string; message: string; duration?: number; widthClass?: string }) => {
        setToast({
            show: true,
            type,
            title: options.title,
            message: options.message,
            widthClass: options.widthClass,
        });

        const duration = options.duration || 3000;
        setTimeout(() => {
            setToast((prev) => ({ ...prev, show: false }));
        }, duration);
    }, []);

    const toastSuccess = useCallback(
        (message: string, title?: string, options?: { duration?: number; widthClass?: string }) => {
            showToast("success", {
                title: title || "Success",
                message,
                duration: options?.duration,
                widthClass: options?.widthClass
            });
        },
        [showToast],
    );

    const toastError = useCallback(
        (message: string, title?: string, options?: { duration?: number; widthClass?: string }) => {
            showToast("error", {
                title: title || "Error",
                message,
                duration: options?.duration,
                widthClass: options?.widthClass
            });
        },
        [showToast],
    );

    const toastWarning = useCallback(
        (message: string, title?: string, options?: { duration?: number; widthClass?: string }) => {
            showToast("warning", {
                title: title || "Warning",
                message,
                duration: options?.duration,
                widthClass: options?.widthClass
            });
        },
        [showToast],
    );

    const closeToast = useCallback(() => {
        setToast((prev) => ({ ...prev, show: false }));
    }, []);

    const value: ToastContextType = {
        toast,
        toastSuccess,
        toastError,
        toastWarning,
        closeToast,
    };

    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

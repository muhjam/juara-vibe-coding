"use client";

import { useToast } from "@/contexts/use-toast";
import { AlertFloating } from "@/components/application/alerts/alerts";
import { motion, AnimatePresence } from "motion/react";

export const GlobalToast = () => {
    const { toast, closeToast } = useToast();

    return (
        <AnimatePresence>
            {toast.show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, x: 40 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: 40 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={`fixed top-4 right-4 z-[100000] ${toast.widthClass || "w-[calc(100%-4rem)] md:w-sm"}`}
                    data-cy="global-toast-notification"
                >
                    <AlertFloating
                        title={toast.title}
                        description={toast.message}
                        confirmLabel="OK"
                        hideFooterActions
                        onClose={closeToast}
                        color={toast.type === "success" ? "success" : toast.type === "error" ? "error" : "warning"}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

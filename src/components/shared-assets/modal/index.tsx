"use client";

import { ReactNode } from "react";
import {
    DialogTrigger as AriaDialogTrigger,
    Heading as AriaHeading
} from "react-aria-components";
import { cx } from "@/utils/cx";
import { Dialog, Modal as BaseModal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { BackgroundPattern } from "@/components/shared-assets/background-patterns";
import { motion } from "framer-motion";

interface ModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    isDismissable?: boolean;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
    /** When true, modal cannot be closed via overlay/ESC/close button; user must choose an action */
    requireActionToClose?: boolean;

    // Header
    title?: string;
    description?: string | ReactNode;
    icon?: React.FC<{ className?: string }>;
    iconColor?: "gray" | "brand" | "error" | "warning" | "success";
    iconTheme?: "light" | "modern" | "modern-neue" | "gradient" | "dark" | "outline";
    showCloseButton?: boolean;

    // Content
    children?: ReactNode;

    // Actions
    primaryAction?: {
        label: string;
        onClick: () => void;
        isLoading?: boolean;
        isDisabled?: boolean;
        icon?: React.FC<{ className?: string }>;
        color?: "primary" | "secondary" | "tertiary" | "primary-destructive" | "secondary-destructive" | "tertiary-destructive" | "link-gray" | "link-color" | "link-destructive";
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
        isDisabled?: boolean;
        color?: "primary" | "secondary" | "tertiary" | "primary-destructive" | "secondary-destructive" | "tertiary-destructive" | "link-gray" | "link-color" | "link-destructive";
    };

    // Footer
    footer?: ReactNode;

    // Styling
    showHeader?: boolean;
    showFooter?: boolean;
    headerBorder?: boolean;
    className?: string | ((state: { isEntering: boolean; isExiting: boolean }) => string);
    variant?: "modal" | "drawer";
    isStickyHeader?: boolean;
    isStickyFooter?: boolean;
    bodyClassName?: string;
    extraContent?: ReactNode;
    contentClassName?: string;
}

const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
};

export const Modal = ({
    isOpen,
    onOpenChange,
    isDismissable = true,
    maxWidth = "lg",
    title,
    description,
    icon: Icon,
    iconColor = "gray",
    iconTheme = "light",
    showCloseButton = true,
    children,
    primaryAction,
    secondaryAction,
    footer,
    showHeader = true,
    showFooter = true,
    headerBorder = false,
    requireActionToClose = false,
    className,
    variant = "modal",
    isStickyHeader = false,
    isStickyFooter = false,
    bodyClassName,
    extraContent,
    contentClassName,
}: ModalProps) => {
    const hasActions = primaryAction || secondaryAction;
    const hasHeader = showHeader && (title || description || Icon);
    const hasFooter = showFooter && (hasActions || footer);

    const effectiveDismissable = !requireActionToClose && isDismissable;
    const effectiveShowClose = !requireActionToClose && showCloseButton;

    const isDrawer = variant === "drawer";

    const handleOpenChange = (open: boolean) => {
        if (requireActionToClose && !open) return;
        onOpenChange(open);
    };

    const renderHeader = () => (
        <div className={cx(
            `flex flex-col gap-3 px-4 pt-5 sm:px-6 sm:pt-6 pb-4 shrink-0 bg-primary`,
            headerBorder ? 'border-b border-secondary' : '',
            isStickyHeader && 'sticky top-0 z-20',
            effectiveShowClose && (isDrawer ? 'pr-14' : 'pr-12')
        )}>
            {Icon && (
                <div className="relative size-max">
                    <FeaturedIcon
                        color={iconColor}
                        size="lg"
                        theme={iconTheme}
                        icon={Icon}
                    />
                    <BackgroundPattern
                        pattern="circle"
                        size="sm"
                        className="absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2"
                    />
                </div>
            )}
            <div className="z-10 flex flex-col gap-0.5">
                {title && (
                    <AriaHeading slot="title" className="text-md font-semibold text-primary">
                        {title}
                    </AriaHeading>
                )}
                {description && (
                    typeof description === 'string' ? (
                        <p className="text-sm text-tertiary">{description}</p>
                    ) : (
                        description
                    )
                )}
            </div>
        </div>
    );

    const renderFooter = () => (
        <div className={cx(
            "z-10 flex flex-col pb-4 sm:pb-6 pt-4 shrink-0 bg-primary",
            isStickyFooter && "sticky bottom-0 border-t border-secondary"
        )}>
            <div className="flex flex-col-reverse gap-3 px-4 sm:flex-row sm:items-center sm:px-6">
                {footer ? (
                    footer
                ) : (
                    <>
                        {secondaryAction && (
                            <Button
                                size="lg"
                                color={secondaryAction.color || "secondary"}
                                className="w-full"
                                onClick={secondaryAction.onClick}
                                isDisabled={secondaryAction.isDisabled || primaryAction?.isLoading}
                            >
                                {secondaryAction.label}
                            </Button>
                        )}
                        {primaryAction && (
                            <Button
                                size="lg"
                                color={primaryAction.color || "primary"}
                                className="w-full"
                                onClick={primaryAction.onClick}
                                isLoading={primaryAction.isLoading}
                                isDisabled={primaryAction.isDisabled}
                                iconLeading={primaryAction.icon}
                            >
                                {primaryAction.label}
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
    );

    return (
        <ModalOverlay
            isDismissable={effectiveDismissable}
            isOpen={isOpen}
            onOpenChange={handleOpenChange}
            className={(state) => cx(
                "fixed inset-0 z-50 flex items-center justify-center bg-overlay/60 outline-hidden backdrop-blur-xs p-4",
                isDrawer && "items-end md:items-center !p-0 md:!p-8",
                state.isEntering ? "fade-in" : (state.isExiting ? "fade-out" : ""),
                typeof className === 'function' ? className(state) : ''
            )}
        >
            <BaseModal
                className={(state) => cx(
                    maxWidthClasses[maxWidth],
                    "relative", // Added relative for positioning children
                    isDrawer && "max-h-[100vh] sm:max-h-[90vh] !rounded-t-3xl md:!rounded-3xl",
                    isDrawer ? (state.isEntering ? 'slide-in-from-bottom' : (state.isExiting ? 'slide-out-to-bottom' : '')) : (state.isEntering ? 'zoom-in-95' : (state.isExiting ? 'zoom-out-95' : ''))
                )}
            >
                {extraContent}
                <Dialog className="outline-hidden flex flex-col max-h-[90vh] overflow-hidden">
                    {() => {
                        const content = (
                            <div className={cx(
                                `relative w-full overflow-hidden bg-primary shadow-xl flex flex-col h-full`,
                                !isDrawer && "rounded-2xl",
                                typeof className === 'string' && className
                            )}>
                                {/* Drawer Handle */}
                                {isDrawer && (
                                    <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
                                        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-800 rounded-full" />
                                    </div>
                                )}

                                {/* Close Button */}
                                {effectiveShowClose && (
                                    <CloseButton
                                        onClick={() => handleOpenChange(false)}
                                        theme="light"
                                        size="lg"
                                        className={cx(
                                            "absolute z-30",
                                            isDrawer ? "top-4 right-4" : "top-3 right-3"
                                        )}
                                    />
                                )}

                                {/* Scrollable Container */}
                                <div className={cx("flex-1 overflow-y-auto min-h-0 relative", bodyClassName)}>
                                    {/* Header */}
                                    {hasHeader && renderHeader()}

                                    {/* Content */}
                                    {children && (
                                        <div className={cx(
                                            hasHeader ? "px-4 sm:px-6" : "px-4 pt-5 pb-4 sm:px-6 sm:pt-6",
                                            hasFooter ? "pb-4" : "pb-4 sm:pb-6",
                                            contentClassName
                                        )}>
                                            {children}
                                        </div>
                                    )}

                                    {/* Footer */}
                                    {hasFooter && renderFooter()}
                                </div>
                            </div>
                        );

                        if (isDrawer) {
                            return (
                                <motion.div
                                    drag="y"
                                    dragConstraints={{ top: 0 }}
                                    dragElastic={0.2}
                                    onDragEnd={(_, info) => {
                                        if (info.offset.y > 150 || info.velocity.y > 500) {
                                            onOpenChange(false);
                                        }
                                    }}
                                    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                                >
                                    {content}
                                </motion.div>
                            );
                        }

                        return content;
                    }}
                </Dialog>
            </BaseModal>
        </ModalOverlay>
    );
};

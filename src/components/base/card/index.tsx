import React from "react";
import { cx } from "@/utils/cx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const Card = ({ children, className, ...props }: CardProps) => {
    return (
        <div 
            className={cx("bg-white shadow-sm rounded-xl border border-secondary", className)} 
            {...props}
        >
            {children}
        </div>
    );
};

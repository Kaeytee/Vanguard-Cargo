import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "default" | "outline" | "ghost";
	size?: "default" | "sm" | "lg" | "icon";
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
		const Comp = asChild ? "span" : "button";

		const variants = {
			default: "bg-red-600 text-white hover:bg-red-700",
			outline: "border border-gray-300 bg-transparent hover:bg-gray-50",
			ghost: "hover:bg-gray-100",
		};

		const sizes = {
			default: "h-10 px-4 py-2",
			sm: "h-9 rounded-md px-3",
			lg: "h-11 rounded-md px-8",
			icon: "h-10 w-10",
		};

		return (
			<Comp
				className={cn(
					"inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
					variants[variant],
					sizes[size],
					className
				)}
				ref={ref}
				{...props}
			/>
		);
	}
);
Button.displayName = "Button";

export { Button };

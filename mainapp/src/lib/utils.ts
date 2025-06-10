// Utility function to concatenate class names conditionally
export function cn(...classes: (string | undefined | false | null)[]) {
	return classes.filter(Boolean).join(" ");
}
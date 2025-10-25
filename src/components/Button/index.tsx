import clsx from "clsx";

type ButtonVariants = "default" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  variant?: ButtonVariants;
  size?: ButtonSize;
} & React.ComponentProps<"button">;

export function Button({
  variant = "default",
  size = "md",
  ...props
}: ButtonProps) {
  const buttonVariants: Record<ButtonVariants, string> = {
    default: clsx("bg-[#C0A231] text-black hover:bg-[#E3C453] "),
    ghost: clsx("bg-[#E0D39f] text-[#46443b]"),
    danger: clsx("bg-red-500 text-white hover:bg-red-600"),
  };

  const sizeVariants: Record<ButtonSize, string> = {
    sm: clsx(
      "text-xs/tight",
      "py-1",
      "px-2",
      "rounded-sm",
      "[&>svg]:h-3 [&>svg]:w-3",
      "gap-1",
    ),
    md: clsx(
      "text-base/tight",
      "py-2",
      "px-4",
      "rounded-md",
      "[&>svg]:h-4 [&>svg]:w-4",
      "gap-2",
    ),
    lg: clsx(
      "text-lg/tight",
      "py-4",
      "px-6",
      "rounded-lg",
      "[&>svg]:h-5 [&>svg]:w-5",
      "gap-3",
    ),
  };

  const buttonClasses = clsx(
    buttonVariants[variant],
    sizeVariants[size],
    "flex cursor-pointer items-center justify-center",
    "transition",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-none",
    props.className,
  );

  return <button {...props} className={buttonClasses} />;
}

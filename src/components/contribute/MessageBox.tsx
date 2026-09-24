import * as React from "react";

export type MessageBoxVariant = "error" | "success" | "warning" | "locked" | "loading";

const messageBoxClasses: Record<MessageBoxVariant, string> = {
  error: "border-[#f1c5c5] bg-[#fff6f6] text-almostblack",
  success: "border-[#bfe3cd] bg-[#f2fff6] text-[#23623a]",
  warning: "border-[#e5b849] bg-[#fff8df] text-almostblack",
  locked: "border-lightgray bg-[#fbfbfd] text-almostblack",
  loading: "border-lightgray bg-white text-darkgray",
};

export function MessageBox({
  variant,
  className,
  children,
}: {
  variant: MessageBoxVariant;
  className?: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className={`${className ? `${className} ` : ""}rounded-md border p-4 text-base ${messageBoxClasses[variant]}`}>
      {children}
    </div>
  );
}

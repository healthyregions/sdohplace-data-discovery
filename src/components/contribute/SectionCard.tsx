import * as React from "react";

type SectionCardProps = {
  children: React.ReactNode;
};

export function NoticeCard({
  tone = "neutral",
  children,
}: SectionCardProps & { tone?: "neutral" | "alert" }): JSX.Element {
  const toneClasses = tone === "alert" ? "border-[#f1c5c5] bg-[#fff6f6]" : "border-lightgray bg-white";
  return <section className={`rounded-md border ${toneClasses} p-8 shadow-sm`}>{children}</section>;
}

export function ContentCard({
  padding = "responsive",
  children,
}: SectionCardProps & { padding?: "responsive" | "large" }): JSX.Element {
  const paddingClasses = padding === "large" ? "p-8" : "p-6 md:p-8";
  return (
    <section className={`rounded-md bg-white ${paddingClasses} shadow-[0_12px_40px_rgba(0,0,0,0.08)]`}>
      {children}
    </section>
  );
}

import * as React from "react";
import Image from "next/image";
import tailwindConfig from "../../../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";

const fullConfig = resolveConfig(tailwindConfig);

type ConversationState = "ready" | "loading" | "response";

interface AIConversationPanelProps {
  state: ConversationState;
  message?: string;
}

const SkeletonLine: React.FC<{ width: string; delay: number }> = ({ width, delay }) => (
  <div
    className="h-4 rounded-full animate-pulse"
    style={{
      width,
      backgroundColor: "#d8c8e8",
      animationDelay: `${delay}ms`,
    }}
  />
);

const AIFaceIcon: React.FC<{ size?: number; showThinking?: boolean }> = ({
  size = 32,
  showThinking = false
}) => (
  <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
    <Image
      src="/icons/ai.svg"
      alt="AI Assistant"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
    />
    {showThinking && (
      <div className="absolute -top-3 -right-3">
        <Image
          src="/icons/think.svg"
          alt="Thinking"
          width={20}
          height={16}
          style={{ objectFit: "contain" }}
        />
      </div>
    )}
  </div>
);

const AIConversationPanel: React.FC<AIConversationPanelProps> = ({
  state,
  message = "",
}) => {
  const renderContent = () => {
    switch (state) {
      case "ready":
        return (
          <p
            className="sm:mr-[2rem]"
            style={{ color: fullConfig.theme.colors["smokegray"], fontSize: "1rem" }}
          >
            I&apos;m ready, go ahead with your question...
          </p>
        );
      case "loading":
        return (
          <div className="flex flex-col gap-3 w-full sm:mr-[2rem]">
            <SkeletonLine width="100%" delay={0} />
            <SkeletonLine width="100%" delay={100} />
            <SkeletonLine width="100%" delay={200} />
            <SkeletonLine width="100%" delay={300} />
          </div>
        );
      case "response":
        const helperText = " If you didn't see the expected results, please try our term search instead.";
        return (
          <p
            className="break-words sm:mr-[2rem]"
            style={{ color: fullConfig.theme.colors["smokegray"], fontSize: "1rem" }}
            dangerouslySetInnerHTML={{ __html: message + helperText }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="w-full"
      style={{
        backgroundColor: fullConfig.theme.colors["lightviolet"],
        border: `1px solid ${fullConfig.theme.colors["frenchviolet"]}`,
        borderRadius: "1.75em",
        marginTop: "0.5em",
      }}
    >
      <div className="px-5 pt-6 pb-8 flex items-start" style={{ gap: "2rem" }}>
        <AIFaceIcon size={32} showThinking={state === "loading"} />
        <div className="flex-1 min-w-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export { AIConversationPanel, AIFaceIcon, SkeletonLine };
export type { ConversationState, AIConversationPanelProps };
export default AIConversationPanel;

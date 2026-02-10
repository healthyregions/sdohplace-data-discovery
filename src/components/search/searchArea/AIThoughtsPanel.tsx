import * as React from "react";
import AIConversationPanel, { ConversationState } from "./AIConversationPanel";

interface AIThoughtsPanelProps {
  isLoading: boolean;
  thoughts: string;
  aiSearch: boolean;
  hasSubmitted?: boolean;
}

const AIThoughtsPanel: React.FC<AIThoughtsPanelProps> = ({
  isLoading,
  thoughts,
  aiSearch,
  hasSubmitted = false,
}) => {
  if (!aiSearch) {
    return null;
  }

  const getConversationState = (): ConversationState => {
    if (isLoading) return "loading";
    if (thoughts) return "response";
    return "ready";
  };

  return (
    <AIConversationPanel
      state={getConversationState()}
      message={thoughts}
    />
  );
};

export default AIThoughtsPanel;

import * as React from "react";
import tailwindConfig from "../../../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";

const fullConfig = resolveConfig(tailwindConfig);

interface AIHintTextProps {
  isMobile?: boolean;
}

const AIHintText: React.FC<AIHintTextProps> = ({ isMobile = false }) => {
  return (
    <div className={isMobile ? "mt-3" : "mt-4 sm:mr-8"}>
      <p
        style={{
          fontSize: isMobile ? "13px" : "16px",
          color: fullConfig.theme.colors["smokegray"],
          marginBottom: "0.5em",
        }}
      >
        Type a research question to get AI-inspired suggestions.
        {!isMobile && (
          <>
            <br />
            e.g. &quot;
            <i>
              What impact does housing stability have on the health outcomes of
              low-income populations?
            </i>
            {" "}
            &quot;
          </>
        )}
      </p>
      {!isMobile && (
        <>
          <hr
            style={{
              border: "none",
              borderTop: `1px solid ${fullConfig.theme.colors["lightgray"]}`,
              margin: "1em 0",
            }}
          />
          <p
            style={{
              fontSize: "12px",
              color: fullConfig.theme.colors["smokegray"],
              margin: 0,
            }}
          >
            Note: We are currently working on integrating filters with AI search
            results. At this time, filters do not apply to AI-generated results.
            Clicking a filter will trigger a re-ask of your question instead.
          </p>
        </>
      )}
    </div>
  );
};

export default AIHintText;

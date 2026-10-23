import * as React from "react";
import tailwindConfig from "../../../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";
import IntroCard from "./introCard";
import ParagraphCard from "./paragraphCard/paragraphCard";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import IconMatch from "../helper/IconMatch";
import HeaderRow from "./headerRow";
import IconTag from "./iconTag";
import ResearchSection from "./researchSection";
import LaunchIcon from "@mui/icons-material/Launch";

interface Props {
  resultList: any[];
  relatedList: any[];
  isMobileView?: boolean;
  onMobileBackToList?: () => void;
}
const fullConfig = resolveConfig(tailwindConfig);

const DetailPanel = (props: Props): JSX.Element => {
  const { showDetailPanel } = useSelector((state: RootState) => state.ui);
  let resultItem = props.resultList.find((r) => r.id === showDetailPanel);
  if (!resultItem) {
    resultItem = props.relatedList.find((r) => r.id === showDetailPanel);
  }
  return (
    resultItem && (
      <div
        className={`container sm:px-11 sm:mb-60 mx-auto bg-white shadow-none aspect-ratio`}
      >
        <div className="flex flex-col sm:flex-row mb-4" id="introCardRow">
          <HeaderRow
            resultItem={resultItem}
            headerIcon={IconMatch(
              resultItem.meta.subject?.length > 0
                ? resultItem.meta.subject[0]
                : ""
            )}
            isMobileView={props.isMobileView}
            onMobileBackToList={props.onMobileBackToList}
          />
        </div>
        {resultItem.meta.subject && (
          <div
            className="flex flex-row flex-wrap gap-3 mb-8"
            id="iconTagRow"
          >
            {resultItem.meta.subject.map((s, index) => (
              <IconTag
                svgIcon={IconMatch(s)}
                key={index}
                label={s}
                labelClass={`text-s font-normal ${fullConfig.theme.fontFamily["sans"]}`}
                labelColor={fullConfig.theme.colors["almostblack"]}
                roundBackground={true}
              />
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row mb-4" id="metadataRow">
          <IntroCard resultItem={resultItem} />
        </div>

        <div className="container border-0 border-t border-solid border-strongorange pt-6">
          <h2 className="m-0 mb-6 font-fredoka font-normal text-2xl">
            Technical Details
          </h2>
        </div>
        <div className="container gap-4 sm:gap-8" id="notesRow">
          {resultItem.meta.display_note &&
            resultItem.meta.display_note.map((s, index) => {
              const [before, after] = (
                s.includes(":") ? s.split(/:(.*)/, 2) : ["", s]
              ) as [string, string];
              return (
                <ParagraphCard
                  key={index}
                  title={before}
                  value={after}
                  type="display_note"
                />
              );
            })}
          {resultItem.meta.data_usage_notes && (
            <ParagraphCard
              type="usage_tip"
              title="Usage Tip"
              value={resultItem.meta.data_usage_notes}
            />
          )}
        </div>
        <div className="container gap-4 sm:gap-8" id="restRow">
          {resultItem.meta.featured_variable && (
            <ParagraphCard
              type="rest"
              title="Featured variable(s):"
              value={resultItem.meta.featured_variable}
            />
          )}
          {resultItem.meta.data_variables && (
            <ParagraphCard
              type="rest"
              title="What's in this dataset?"
              value={resultItem.meta.data_variables.join(", ")}
              collapsible={true}
            />
          )}
          {resultItem.meta.methods_variables && (
            <ParagraphCard
              type="rest"
              title="Measures and data input:"
              value={resultItem.meta.methods_variables.join(", ")}
              collapsible={true}
            />
          )}
          {resultItem.meta.references && (
            <ParagraphCard
              type="references"
              title="Link"
              value={resultItem.meta.references}
            />
          )}
        </div>
        <div className="text-s text-darkgray mt-2" id="feedbackRow">
          See anything wrong or missing?{" "}
          <a
            href="https://sdohplace.org/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-frenchviolet no-underline"
          >
            Share feedback
            <LaunchIcon sx={{ fontSize: "0.875rem" }} />
          </a>
        </div>
        <ResearchSection resultItem={resultItem} />
      </div>
    )
  );
};

export default DetailPanel;

import * as React from "react";
import DOMPurify from "dompurify";
import tailwindConfig from "../../../../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";
import { displayNotesIcons } from "./displayNotesIcons";
import { ParseReferenceLink } from "../../helper/ParsingMethods";

interface Props {
  type: string;
  title: string;
  value: string;
  collapsible?: boolean;
}

const fullConfig = resolveConfig(tailwindConfig);
const paragraphCardStyle: React.CSSProperties = {
  color: `${fullConfig.theme.colors["almostblack"]}`,
  fontFamily: `${fullConfig.theme.fontFamily["sans"]}`,
  fontSize: "0.875rem",
};
const linkStyle: React.CSSProperties = {
  color: `${fullConfig.theme.colors["frenchviolet"]}`,
};

const DisplayNote = ({ title, value }) => {
  return (
    <div className={`container`}>
      {title ? (
        <span
          dangerouslySetInnerHTML={{ __html: displayNotesIcons[title] }}
          className="mr-1"
        />
      ) : (
        <span
          dangerouslySetInnerHTML={{ __html: "&#x1f4dd;" }}
          className="mr-1"
        />
      )}
      <b>{title ? title : "Notes"}:</b>{" "}
      <span
        style={paragraphCardStyle}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value) }}
      />
    </div>
  );
};

const UsageTip = ({ value }) => {
  return (
    <div className={`container`}>
      &#128161; <b>Usage Tip:</b>{" "}
      <span
        style={paragraphCardStyle}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value) }}
      />
    </div>
  );
};

const Link = ({ value }) => {
  const links = ParseReferenceLink(value);
  if (links.downloadUrl || links.dataDictionaryUrl || links.archiveUrl) {
    return (
      <div className="container">
        <b className="text-s">More links:</b>
        <ul className={"py-2"}>
          {links.downloadUrl && (
            <li>
              <a
                href={String(links.downloadUrl)}
                style={{...paragraphCardStyle, ...linkStyle}}
              >
                Data Download (Official)
              </a>
            </li>
          )}
          {links.archiveUrl && (
            <li>
              <a
                href={String(links.archiveUrl)}
                style={{...paragraphCardStyle, ...linkStyle}}
              >
                Data Archival Copy
              </a>
            </li>
          )}
          {links.dataDictionaryUrl && (
            <li>
              <a
                href={String(links.dataDictionaryUrl)}
                style={{...paragraphCardStyle, ...linkStyle}}
              >
                Technical Documentation
              </a>
            </li>
          )}
        </ul>
      </div>
    );
  } else {
    return <></>;
  }
};

const ParagraphCard = (props: Props): JSX.Element => {
  return (
    <div className="container mx-auto bg-white shadow-none aspect-ratio mb-6">
      {props.type === "display_note" && (
        <DisplayNote title={props.title} value={props.value} />
      )}
      {props.type === "usage_tip" && <UsageTip value={props.value} />}
      {props.type === "references" && <Link value={props.value} />}
      {props.type === "rest" && (
        <div className={`container`}>
          {props.collapsible ? (
            <details>
              <summary className="text-s">
                <b>{props.title}</b>
              </summary>
              <span style={paragraphCardStyle}>{props.value}</span>
            </details>
          ) : (
            <>
              <b className="text-s">{props.title}</b>{" "}
              <span style={paragraphCardStyle}>{props.value}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ParagraphCard;

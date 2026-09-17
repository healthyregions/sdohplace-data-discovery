import { DatasetSubmissionValues } from "@/services/SubmissionService";

export type ExampleRecord = {
  recordId: string;
  platformUrl: string;
  values: Partial<DatasetSubmissionValues>;
};

export const EXAMPLE_RECORD: ExampleRecord = {
  recordId: "herop-yumqkc",
  platformUrl: "https://search.sdohplace.org/?query=+Opportunity+Index&show=herop-yumqkc",
  values: {
    title: "Opportunity Index",
    description:
      "The Opportunity Index provides a snapshot of conditions that can be used to identify and improve access to opportunity for residents and their communities. The data and full analysis online show how opportunity index scores have changed over time and what access to opportunity looks like today. The raw data is only available for request.",
    subject: "Economic Stability",
    keywords: "Community Development\nAffordability\nSDOH",
    creator: "Child Trends and the Forum for Youth Investment’s Opportunity Nation campaign",
    publisher: "Child Trends and the Forum for Youth Investment’s Opportunity Nation campaign",
    accessRights: "Public",
    dataUrl: "https://opportunityindex.org/resources/",
    documentationUrl: "https://opportunityindex.org/",
    spatialResolution: "County",
    spatialCoverage: "United States",
    temporalCoverage: "2016-2023",
    preferredCitation: "Opportunity Index. (2013, July 30). Opportunity Index. https://opportunityindex.org/",
    dataVariables: "Overall economy score\nOverall education score\nOverall community score\nOverall health score",
  },
};

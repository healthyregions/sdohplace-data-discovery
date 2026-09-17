import * as React from "react";
import type { NextPage } from "next";
import BasicPageMeta from "@/components/meta/BasicPageMeta";
import NavBar from "@/components/NavBar";
import Footer from "@/components/homepage/footer";
import { ContentCard } from "@/components/contribute/SectionCard";
import { SUPPORT_EMAIL } from "@/services/contributorRequest";

function Section({ title, children }: { title: string; children: React.ReactNode }): JSX.Element {
  return (
    <section className="border-t border-lightgray pt-8">
      <h2 className="mb-4 text-2xl font-bold text-almostblack">{title}</h2>
      {children}
    </section>
  );
}

const lifecycle = [
  ["Draft", "Yours to edit. Saves automatically and is not visible to reviewers yet."],
  ["Submitted", "Sent for review. Locked while a reviewer looks at it."],
  ["Needs changes", "A reviewer asked for edits. Editable again, with their comments shown at the top."],
  ["Approved", "Accepted by a reviewer and waiting to be added to the search platform."],
  ["Published", "Live and searchable on the discovery platform. You are emailed when this happens."],
  ["Unpublished", "Was published, and has since been removed from search. You are emailed when this happens."],
  ["Rejected", "Closed. You can still open it, copy anything useful, or remove it."],
];

const ContributeHelpPage: NextPage = () => {
  return (
    <>
      <BasicPageMeta
        title="How Contributing Works"
        description="A guide to submitting datasets to the SDOH & Place discovery platform."
      />
      <NavBar />
      <main className="min-h-screen bg-[#f7f4fb] px-6 pb-24 pt-36">
        <div className="mx-auto max-w-4xl">
          <ContentCard>
            <div className="mb-6 inline-flex rounded-full bg-lightviolet px-4 py-2 text-sm font-bold uppercase text-frenchviolet">
              Contributor Guide
            </div>
            <h1 className="mb-4 text-4xl font-bold text-almostblack">How Contributing Works</h1>
            <p className="mb-10 max-w-3xl text-lg leading-8 text-almostblack">
              This page explains what happens to your submission, which fields you fill in yourself,
              and which ones we work out from your data.
            </p>

            <div className="grid gap-10">
              <Section title="The four steps">
                <ol className="m-0 grid gap-3 pl-5 text-base leading-7 text-almostblack">
                  <li>
                    <strong>Describe.</strong> The dataset&rsquo;s title, a short description, its
                    subject, and a few keywords people might search for.
                  </li>
                  <li>
                    <strong>Attribution.</strong> Who created it, who publishes it, where to get
                    it, and whether it is public or restricted.
                  </li>
                  <li>
                    <strong>Location.</strong> Upload a data file and we work out the geography.
                    Then confirm the resolution and the years it covers.
                  </li>
                  <li>
                    <strong>Review.</strong> Check everything, confirm the citation we drafted for
                    you, add any optional details, and submit.
                  </li>
                </ol>
                <p className="mb-0 mt-4 text-base leading-7 text-almostblack">
                  The citation is written for you from your earlier answers; edit it if the source
                  has its own preferred wording. Everything under Optional details can be left for
                  a reviewer to complete.
                </p>
              </Section>
              
              <Section title="How your work is saved">
                <p className="m-0 text-base leading-7 text-almostblack">
                  Your draft is saved automatically at three moments:
                </p>
                <ul className="mb-0 mt-4 grid gap-2 pl-5 text-base leading-7 text-almostblack">
                  <li>
                    When you finish a field and click or tab away from it, if you changed something.
                  </li>
                  <li>Every 20 minutes, in case you leave a field open for a long time.</li>
                  <li>As soon as geospatial metadata finishes generating.</li>
                </ul>
                <p className="mb-0 mt-4 text-base leading-7 text-almostblack">
                  The status line next to the Save buttons shows when the last save happened. Those
                  buttons stay at the bottom of the form as you scroll, so you can save at any time
                  with <strong>Save Draft</strong>.
                </p>
                <p className="mb-0 mt-4 text-base leading-7 text-almostblack">
                  Everything is saved on our servers rather than in your browser. That means you can
                  pick a draft up on another computer, but it also means an edit you have not moved
                  away from yet is not saved anywhere. If you are about to close the tab in the
                  middle of typing, click <strong>Save Draft</strong> first.
                </p>
                <p className="mb-0 mt-4 text-base leading-7 text-almostblack">
                  If your sign-in expires while you are working, the page stays exactly as it is and
                  asks you to sign in again. Nothing on screen is thrown away.
                </p>
              </Section>

              <Section title="Generating geospatial metadata">
                <p className="m-0 text-base leading-7 text-almostblack">
                  Upload the data file your dataset is based on and we calculate the geometry,
                  bounding box, centroid, spatial coverage, and geographic IDs for you. For a CSV,
                  you also choose the boundary year and the spatial level the rows represent.
                </p>
                <p className="mb-0 mt-4 text-base leading-7 text-almostblack">
                  <strong>Geometry is required</strong> before you can submit, because it is what
                  places your dataset on the map. You can move through the steps and save a draft
                  without it, but the review step will ask you to upload a file first. Geographic
                  IDs are filled in when the data matches census units; some datasets, such as
                  custom boundaries, will not have them, and that is fine.
                </p>
                <ul className="mb-0 mt-4 grid gap-2 pl-5 text-base leading-7 text-almostblack">
                  <li>
                    You can upload a data table as CSV, or a spatial file: a zipped shapefile,
                    GeoJSON, or GeoPackage.
                  </li>
                  <li>
                    For a shapefile, put the .shp, .shx, .dbf and .prj files together in one .zip.
                  </li>
                  <li>
                    A CSV needs a column of geographic IDs, usually called GEOID or FIPS, and the
                    IDs must match the spatial level you pick. County rows use five-digit codes,
                    census tracts use eleven.
                  </li>
                  <li>
                    Spatial files already carry their own geometry, so you are not asked for a
                    boundary year or spatial level.
                  </li>
                  <li>Files can be up to 500 MB.</li>
                  <li>
                    Most files finish in under a minute. Large ones can take several, and we stop
                    waiting after 10 minutes &mdash; if that happens your upload is still saved, so
                    wait a little and click Generate again to pick up the result.
                  </li>
                  <li>
                    You can close the progress window and keep editing while it runs.
                  </li>
                </ul>
                <p className="mb-0 mt-4 text-base leading-7 text-almostblack">
                  If generation fails, the most common reason is a mismatch between the ID column
                  and the spatial level. Check both and try again.
                </p>
              </Section>

              <Section title="Fields we fill in for you">
                <p className="m-0 text-base leading-7 text-almostblack">
                  Bounding Box, Centroid, Geographic IDs, and Geometry are greyed out because they
                  are calculated from your upload rather than typed in. This keeps them consistent
                  with the boundary files the search map uses. Everything else on the form is yours
                  to write.
                </p>
              </Section>

              <Section title="What happens after you submit">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-base">
                    <thead>
                      <tr className="border-b border-lightgray text-sm uppercase text-darkgray">
                        <th className="py-3 pr-4">Status</th>
                        <th className="py-3 pr-4">What it means</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lifecycle.map(([status, meaning]) => (
                        <tr key={status} className="border-b border-lightgray">
                          <td className="py-4 pr-4 font-bold text-almostblack">{status}</td>
                          <td className="py-4 pr-4 leading-7 text-almostblack">{meaning}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mb-0 mt-4 text-base leading-7 text-almostblack">
                  Approval and publication are separate steps. A reviewer approving your submission
                  means it has been accepted; it only becomes <strong>Published</strong> once an
                  administrator adds it to the search platform, and that is when you are emailed
                  that it is live. You are emailed at each stage, including if a published record is
                  later removed.
                </p>
              </Section>

              <Section title="Getting help">
                <p className="m-0 text-base leading-7 text-almostblack">
                  If something does not work or a message does not make sense, email{" "}
                  <a className="font-bold text-frenchviolet underline" href={`mailto:${SUPPORT_EMAIL}`}>
                    {SUPPORT_EMAIL}
                  </a>{" "}
                  and include a screenshot if you can.
                </p>
              </Section>
            </div>
          </ContentCard>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ContributeHelpPage;

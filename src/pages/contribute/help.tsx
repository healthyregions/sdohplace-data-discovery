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
  ["Approved", "Accepted by a reviewer. Locked, and queued for publication."],
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
                  Upload the CSV your dataset is based on, choose the boundary year and the spatial
                  level the rows represent, and we calculate the geometry, bounding box, centroid,
                  spatial coverage, and geographic IDs for you.
                </p>
                <ul className="mb-0 mt-4 grid gap-2 pl-5 text-base leading-7 text-almostblack">
                  <li>Your CSV needs a column of geographic IDs, usually called GEOID or FIPS.</li>
                  <li>
                    The IDs must match the spatial level you pick. County rows use five-digit codes,
                    census tracts use eleven.
                  </li>
                  <li>CSV is the only format supported at the moment.</li>
                  <li>
                    Large files can take several minutes. You can close the progress window and keep
                    editing while it runs.
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
                  Approval and publication are separate steps. After a reviewer approves your
                  submission, it becomes searchable once an administrator publishes it. You are
                  emailed at each stage.
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

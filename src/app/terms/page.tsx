import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageEnd } from "@/components/sections/page-end";
import { LegalHero } from "@/components/sections/legal-hero";
import { LegalTableOfContents, type TocItem } from "@/components/sections/privacy-toc";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms that govern your use of the S. P. A. Ajibade & Co. website.",
  alternates: { canonical: "/terms" },
  robots: { index: false },
};

/** Shown under the title once the firm confirms it (the source document leaves the date blank). */
const EFFECTIVE_DATE = "";

// The clause numbers below are the ones in the firm's document: the text refers to them
// ("clause 3", "clause 7"), so they are written out rather than generated.
const contents: TocItem[] = [
  { label: "About these Terms", href: "#about-these-terms" },
  { label: "Using the Website", href: "#using-the-website" },
  { label: "Legal information and no lawyer-client relationship", href: "#no-lawyer-client-relationship" },
  { label: "Enquiries and submissions", href: "#enquiries-and-submissions" },
  { label: "Automated chat assistant", href: "#automated-chat-assistant" },
  { label: "Content and publications", href: "#content-and-publications" },
  { label: "Intellectual property", href: "#intellectual-property" },
  { label: "Third-party websites and links", href: "#third-party-websites" },
  { label: "Privacy and cookies", href: "#privacy-and-cookies" },
  { label: "Website availability and security", href: "#availability-and-security" },
  { label: "Disclaimers and liability", href: "#disclaimers-and-liability" },
  { label: "Changes to these Terms", href: "#changes-to-these-terms" },
  { label: "Governing law and disputes", href: "#governing-law-and-disputes" },
  { label: "General provisions", href: "#general-provisions" },
  { label: "Contact us", href: "#contact-us" },
];

const link = "font-medium text-cobalt underline underline-offset-2";

function Mail({ address }: { address: string }) {
  return (
    <a href={`mailto:${address}`} className={link}>
      {address}
    </a>
  );
}

function Clause({ id, n, title, first = false, children }: { id: string; n: number; title: string; first?: boolean; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-title`}>
      <h2 id={id} className={`font-serif text-3xl leading-tight text-ink md:text-4xl ${first ? "" : "mt-12"}`}>
        <span id={`${id}-title`}>
          {n}. {title}
        </span>
      </h2>
      {children}
    </section>
  );
}

/** A paragraph of a clause that has no sub-number. */
function P({ children, first = false }: { children: ReactNode; first?: boolean }) {
  return <p className={first ? "mt-5" : "mt-4"}>{children}</p>;
}

/** A numbered sub-clause such as 3.1, hanging in its own column. */
function Sub({ n, children, first = false }: { n: string; children: ReactNode; first?: boolean }) {
  return (
    <div className={`${first ? "mt-5" : "mt-4"} flex gap-4`}>
      <span className="w-10 shrink-0 font-medium text-ink">{n}</span>
      <p className="min-w-0">{children}</p>
    </div>
  );
}

function Bullets({ items, indent = false }: { items: ReactNode[]; indent?: boolean }) {
  return (
    <ul className={`mt-4 list-disc space-y-2 pl-6 ${indent ? "ml-14" : ""}`}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function TermsPage() {
  return (
    <>
      <LegalHero title="Terms of Use" />
      <section className="bg-white py-12 md:py-17">
        <div className="container-site grid gap-12 lg:grid-cols-[220px_minmax(0,760px)] lg:gap-20">
          <LegalTableOfContents contents={contents} label="Terms of use contents" />

          <div className="min-w-0 text-[15px] leading-8 text-ink-800 md:text-base md:leading-8">
            {EFFECTIVE_DATE ? <p className="mb-8 text-sm text-stone">Effective date: {EFFECTIVE_DATE}</p> : null}

            <Clause id="about-these-terms" n={1} title="About These Terms" first>
              <P first>
                These Terms of Use (“Terms”) govern your access to and use of the website operated by S. P. A. Ajibade &amp; Co. (“the Firm”, “we”, “us” or “our”) at spaajibade.com, including its pages, articles, publications, forms, “Discuss a Mandate” feature, automated chat assistant and other digital features made available through the Website (together, the “Website”).
              </P>
              <P>
                By accessing or using the Website, you agree to these Terms. By continuing to browse the website, you acknowledge them. If you do not agree with these Terms, you should not use the Website.
              </P>
              <P>
                These Terms should be read with our{" "}
                <Link href="/privacy" className={link}>
                  Privacy Policy
                </Link>
                , which explains how we collect, use, disclose, store and otherwise process personal data obtained through the Website.
              </P>
              <P>
                These Terms govern use of the Website only. If you become a client, your engagement letter or terms of engagement govern our legal services and are not replaced or modified by these Terms.
              </P>
              <P>The Website is not directed at persons under 18, and you must not submit personal data about a child through it.</P>
            </Clause>

            <Clause id="using-the-website" n={2} title="Using the Website">
              <P first>You may use the Website for lawful purposes and in accordance with these Terms. You must not:</P>
              <Bullets
                items={[
                  "breach any applicable law or regulation;",
                  "attempt to gain unauthorised access to the Website, its systems or servers, or interfere with their security, operation or availability;",
                  "introduce viruses, malware or other harmful code;",
                  "submit information that you know to be false, misleading or fraudulent, or impersonate another person or organisation;",
                  "use the Website to send unsolicited commercial communications;",
                  "collect personal information relating to our personnel or other users without lawful authority; or",
                  "use the Website for unlawful, fraudulent, abusive or malicious purposes.",
                ]}
              />
              <P>
                We may restrict access to the Website where reasonably necessary to protect the Website, its users or the Firm, including where we reasonably believe these Terms have been breached. Restrictions on automated access to, and use of, Website content are set out in clause 7.
              </P>
            </Clause>

            <Clause id="no-lawyer-client-relationship" n={3} title="Legal Information and No Lawyer-Client Relationship">
              <Sub n="3.1" first>
                Everything on the Website, including information about our practice areas, people, articles, insights, publications, news and events, and every response from the chat assistant, is general information only. It is not legal advice and is no substitute for advice from a qualified legal practitioner.
              </Sub>
              <Sub n="3.2">
                No lawyer-client relationship arises from your use of the Website, including reading content, emailing us, submitting a form, requesting a consultation, using “Discuss a Mandate”, booking an appointment or using the chat assistant, nor from any acknowledgment we send.
              </Sub>
              <Sub n="3.3">
                A lawyer-client relationship exists only when the Firm confirms in writing that it has accepted your instruction, ordinarily after the execution of an engagement letter or other applicable terms of engagement.
              </Sub>
              <Sub n="3.4">
                If your matter is urgent or subject to a limitation period, court deadline or other time-sensitive requirement, contact the Firm by telephone or email. Do not rely solely on the Website or an online submission.
              </Sub>
            </Clause>

            <Clause id="enquiries-and-submissions" n={4} title="Enquiries and Submissions">
              <Sub n="4.1" first>
                “Submission” means anything you send to us through the Website, including contact forms, “Discuss a Mandate”, newsletter sign-ups and chatbot messages. A request submitted through the Website is an initial enquiry only. It is not an instruction and does not oblige the Firm to accept the matter.
              </Sub>
              <Sub n="4.2">
                Provide only what is reasonably necessary for us to understand your enquiry. Do not submit privileged, confidential or highly sensitive information. You are responsible for ensuring that your Submissions are accurate and that you are authorised to provide any personal data about other people.
              </Sub>
              <Sub n="4.3">
                You retain ownership of your Submissions and permit the Firm to copy, store, review and share them internally and with our service providers for those purposes only. We will not otherwise use or publish them.
              </Sub>
              <Sub n="4.4">
                An automated acknowledgement confirms only that your request was received. Where the Website offers a booking facility, selecting a time is a request for an appointment, which is confirmed only when the Firm confirms it to you.
              </Sub>
            </Clause>

            <Clause id="automated-chat-assistant" n={5} title="Automated Chat Assistant">
              <Sub n="5.1" first>
                The Website provides a chat assistant (the “Assistant”) to help you find general information about the Firm, its people, practice areas and Website content. Clause 3 applies to everything the Assistant says.
              </Sub>
              <Sub n="5.2">
                The Assistant’s responses may be incomplete, inaccurate or out of date. Verify anything important with the Firm before acting on it.
              </Sub>
              <Sub n="5.3">
                The Assistant cannot accept instructions, open a matter, quote or agree fees, confirm limitation periods or deadlines, or make any statement or commitment on behalf of the Firm. No statement by the Assistant binds the Firm unless confirmed in writing by a member of the Firm.
              </Sub>
              <Sub n="5.4">
                You must not use the Assistant for unlawful or harmful purposes, or attempt to circumvent, manipulate or interfere with its operation or security, including by prompt injection or attempts to extract its instructions.
              </Sub>
            </Clause>

            <Clause id="content-and-publications" n={6} title="Content and Publications">
              <Sub n="6.1" first>
                We aim to ensure that articles, legal updates, insights and other materials are accurate when published, but laws and circumstances change. Unless stated otherwise, each publication reflects the position at its date of publication and may not reflect later developments.
              </Sub>
              <Sub n="6.2">
                Descriptions of the Firm, its practice areas, people, experience, matters and recognitions may also change from time to time.
              </Sub>
            </Clause>

            <Clause id="intellectual-property" n={7} title="Intellectual Property">
              <Sub n="7.1" first>
                The Website and its content, including the S.P.A. Ajibade &amp; Co. name and branding, text, articles, publications, graphics, photographs, logos, trademarks, design, layout and code, are owned by or licensed to the Firm and are protected by applicable intellectual property laws.
              </Sub>
              <Sub n="7.2">
                We grant you a limited, non-exclusive, non-transferable, revocable right to access and use the Website for lawful personal or internal business purposes. You may download or print reasonable copies for personal or internal reference, provided you keep all copyright, trademark and proprietary notices intact.
              </Sub>
              <Sub n="7.3">
                Without our prior written permission, you must not reproduce or republish substantial portions of Website content, modify or adapt it, distribute or commercially exploit it, create derivative works from it, or use our name, logo or other branding in a way that suggests an unauthorised association with the Firm.
              </Sub>
              <Sub n="7.4">
                Without our prior written permission, you must not use any robot, scraper, crawler or other automated means to access, copy or collect Website content, and you must not use Website content, or any text or data mining of it, to train, fine-tune or ground any artificial intelligence or machine-learning system. The Firm expressly reserves all rights in the Website content for this purpose, save that ordinary search-engine indexing is permitted.
              </Sub>
              <Sub n="7.5">
                You may quote reasonable extracts from our articles and publications for legitimate non-commercial purposes such as commentary, criticism, review or research, to the extent permitted by the fair dealing provision of the Copyright Act 2022, provided you acknowledge S. P. A. Ajibade &amp; Co. and, where practicable, provide a link to the original publication.
              </Sub>
            </Clause>

            <Clause id="third-party-websites" n={8} title="Third-Party Websites and Links">
              <P first>
                The Website may contain links to third-party websites and platforms, including LinkedIn, Mondaq and so on. Links are provided for convenience and are not an endorsement. We do not control third-party services and are not responsible for their content, availability, security or privacy practices. Your use of them is subject to their own terms and policies.
              </P>
            </Clause>

            <Clause id="privacy-and-cookies" n={9} title="Privacy and Cookies">
              <P first>
                We process personal data obtained through the Website in accordance with the Nigeria Data Protection Act 2023 and other applicable law, as described in the{" "}
                <Link href="/privacy" className={link}>
                  Privacy Documents
                </Link>
                , which also explain our use of cookies and similar technologies and how to manage them. For privacy-related enquiries, please contact our Data Protection Officer at: <Mail address="dataprivacy@spaajibade.com" />
              </P>
            </Clause>

            <Clause id="availability-and-security" n={10} title="Website Availability and Security">
              <Sub n="10.1" first>
                We aim to keep the Website available and secure, but we do not guarantee that it will be uninterrupted or error-free. We may modify, suspend or discontinue any part of it at any time. You are responsible for taking reasonable steps to protect your own devices, systems and information.
              </Sub>
              <Sub n="10.2">
                If you identify a security vulnerability or significant technical issue affecting the Website, please report it to <Mail address="ithelpdesk@spaajibade.com" /> and provide sufficient information for us to investigate. We will not pursue action against you for research carried out in good faith that:
              </Sub>
              <Bullets
                indent
                items={[
                  "is limited to what is needed to demonstrate the vulnerability;",
                  "does not access, alter, copy, retain or delete data belonging to others, or degrade the Website;",
                  "does not involve social engineering, denial-of-service attacks or physical access; and",
                  "is kept confidential until we have had a reasonable opportunity to fix the issue and have agreed to disclosure.",
                ]}
              />
              <p className="ml-14 mt-4">This paragraph does not authorise any conduct that is unlawful, and we offer no reward for reports.</p>
            </Clause>

            <Clause id="disclaimers-and-liability" n={11} title="Disclaimers and Liability">
              <Sub n="11.1" first>
                The Website and its content are provided “as is” and “as available”, to the fullest extent permitted by law. We do not warrant that the Website will be available, secure, complete, accurate, current, error-free or free from viruses or other harmful components.
              </Sub>
              <Sub n="11.2">
                To the fullest extent permitted by Nigerian law, the Firm is not liable for any loss or damage, including indirect or consequential loss, loss of profit, loss of data or loss of opportunity, arising from your use of or inability to use the Website, or from reliance on its content or on the Assistant.
              </Sub>
              <Sub n="11.3">
                Nothing in these Terms excludes or limits liability that cannot lawfully be excluded or limited, or any duty or liability the Firm owes a client under an engagement letter, terms of engagement or professional rules.
              </Sub>
            </Clause>

            <Clause id="changes-to-these-terms" n={12} title="Changes to These Terms">
              <P first>
                We may update these Terms from time to time to reflect changes to the Website, our services, the law or our practices. The current version will be published on this page with its effective and last-updated dates. Where appropriate, we may notify users of material changes through the Website or other reasonable means. Your continued use of the Website after updated Terms take effect constitutes acceptance of the revised Terms.
              </P>
            </Clause>

            <Clause id="governing-law-and-disputes" n={13} title="Governing Law and Disputes">
              <Sub n="13.1" first>These Terms are governed by the laws of the Federal Republic of Nigeria.</Sub>
              <Sub n="13.2">
                If a dispute arises in connection with these Terms or your use of the Website, the parties should first seek to resolve the matter amicably.
              </Sub>
              <Sub n="13.3">
                Where the dispute cannot be resolved amicably, it shall be subject to the jurisdiction of a court of competent jurisdiction in Lagos State, Nigeria, unless applicable law provides otherwise. The Firm may seek urgent injunctive relief to protect its intellectual property or the security of the Website in any court of competent jurisdiction.
              </Sub>
            </Clause>

            <Clause id="general-provisions" n={14} title="General Provisions">
              <h3 className="mt-6 font-serif text-xl text-ink">Entire Agreement</h3>
              <p className="mt-2">These Terms and the Privacy Documents are the entire agreement between you and the Firm concerning use of the Website.</p>
              <h3 className="mt-6 font-serif text-xl text-ink">Severability</h3>
              <p className="mt-2">If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions remain in effect.</p>
              <h3 className="mt-6 font-serif text-xl text-ink">No Waiver</h3>
              <p className="mt-2">
                A failure or delay by the Firm to enforce any provision of these Terms does not constitute a waiver of that provision or any other right.
              </p>
              <h3 className="mt-6 font-serif text-xl text-ink">Assignment</h3>
              <p className="mt-2">
                You may not transfer your rights or obligations under these Terms without our prior written consent. The Firm may transfer its rights or obligations where reasonably necessary in connection with a restructuring, merger, succession or transfer of the Website or relevant business operations.
              </p>
              <h3 className="mt-6 font-serif text-xl text-ink">Language</h3>
              <p className="mt-2">These Terms are provided in English.</p>
            </Clause>

            <Clause id="contact-us" n={15} title="Contact Us">
              <P first>For questions concerning these Terms or the Website, please contact:</P>
              <address className="mt-4 space-y-1 not-italic">
                <p className="font-medium text-ink">S. P. A. Ajibade &amp; Co.</p>
                <p>
                  <strong className="font-semibold text-ink">General enquiries:</strong> <Mail address="info@spaajibade.com" />
                </p>
                <p>
                  <strong className="font-semibold text-ink">Lagos office:</strong> <Mail address="lagosoffice@spaajibade.com" />
                </p>
                <p>
                  <strong className="font-semibold text-ink">Data protection:</strong> <Mail address="dataprivacy@spaajibade.com" />
                </p>
              </address>
              <address className="mt-5 not-italic">
                <p className="font-semibold text-ink">Lagos Office:</p>
                <p>Suite 201, 27A Macarthy Street,</p>
                <p>Onikan, Lagos, Nigeria.</p>
              </address>
              <P>
                Contact details for our other offices are available on our{" "}
                <Link href="/offices" className={link}>
                  Contact page
                </Link>
                .
              </P>
            </Clause>
          </div>
        </div>
      </section>
      <PageEnd faq={false} />
    </>
  );
}

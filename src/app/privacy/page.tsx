import Image from "next/image";
import type { Metadata } from "next";
import { PageEnd } from "@/components/sections/page-end";
import { PrivacyTableOfContents } from "@/components/sections/privacy-toc";
import { FIGMA } from "@/lib/figma-assets";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false },
};

const glossary = [
  ["Data Subject", "An individual to whom personal data relates or any person who can be identified directly or indirectly."],
  ["Data Controller", "The person or entity that determines the purposes and means of processing personal data."],
  ["Data Processor", "The person or entity that processes personal data on behalf of a data controller."],
  ["Consent", "A freely given, specific, informed and unambiguous indication of a person's wishes."],
  ["Personal Data", "Information relating to an identified or identifiable natural person."],
  ["Sensitive Personal Data", "Personal data relating to genetic or biometric information, ethnicity, religion, health, sex life, political opinions, trade unions or other information prescribed by the NDPC."],
  ["Processing", "Any operation performed on personal data, including collection, storage, use, disclosure, alteration, restriction, erasure or destruction."],
  ["Third Party", "Any person or entity other than the data subject, controller, processor or persons engaged to process data for them."],
  ["Personal Data Breach", "A security breach that may result in unauthorised access, disclosure, loss or alteration of personal data."],
  ["Foreign Country", "A country outside Nigeria or another territory outside the Nigerian data protection regime."],
  ["Data Subject Access Request", "A formal request for a copy of personal data held by the firm."],
];

export default function PrivacyPage() {
  return (
    <>
      <section
        data-header-theme="dark"
        className="relative -mt-(--header-h) overflow-hidden bg-ink pt-(--header-h) text-white"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.08]"
          style={{ backgroundImage: `url(${FIGMA.videoMark})` }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 top-1/2 hidden w-[42vw] -translate-y-1/2 opacity-[0.12] md:block"
        >
          <Image src="/brand/mark.png" alt="" width={240} height={240} className="h-auto w-full" priority />
        </div>
        <div className="container-site relative py-16 md:py-20">
          <h1 className="max-w-4xl font-serif text-[2.75rem] leading-[1.02] normal-case tracking-[-0.02em] md:text-[4.25rem]">
            Privacy Policy
          </h1>
        </div>
      </section>
      <section className="bg-white py-12 md:py-17">
        <div className="container-site grid gap-12 lg:grid-cols-[220px_minmax(0,760px)] lg:gap-20">
          <PrivacyTableOfContents />

          <div className="min-w-0 text-[15px] leading-8 text-ink-800 md:text-base md:leading-8">
            <h2 id="introduction" className="font-serif text-3xl leading-tight text-ink md:text-4xl">
              1. Introduction
            </h2>
            <p className="mt-5">
              S. P. A. Ajibade & Co. (“S.P.A. Ajibade”, “Firm”, “we”, “us” or “our”) respects your privacy and is committed to safeguarding the personal data we collect, control or process in accordance with applicable data protection laws.
            </p>
            <p className="mt-4">
              This Privacy Policy describes our handling of personal identifiers, electronic network activity, professional information, location information and other information described below. It applies to our website, online platforms, applications, services and tools, regardless of how you access or use them.
            </p>
            <p className="mt-4">
              This Policy applies to our systems, operations and processes involving the collection, storage, use, transmission and disposal of personal data. It does not apply to processing activities outside our control, including third-party platforms and websites.
            </p>

            <h2 id="consent" className="mt-12 font-serif text-3xl leading-tight text-ink md:text-4xl">
              2. Consent
            </h2>
            <p className="mt-5">
              By accessing or using our services and website, you indicate that you have read and accepted this Privacy Policy and consent to the practices described here. You confirm that you have the legal capacity to give consent and understand your privacy rights and the option to withdraw consent at any time.
            </p>
            <p className="mt-4">
              If you do not accept this Policy, you may not access or use our services or website.
            </p>

            <h2 id="information-we-collect" className="mt-12 font-serif text-3xl leading-tight text-ink md:text-4xl">
              3. Information we collect
            </h2>
            <p className="mt-5">
              We collect and process personal information about our clients, partners, vendors, contractors, employees, prospective employees, website visitors and other people with whom we communicate or transact.
            </p>
            <ul className="mt-5 list-disc space-y-2 pl-6">
              <li>Basic details such as name, previous name, title, employer or former employer, date and place of birth.</li>
              <li>Contact details such as residential address, email address and mobile number.</li>
              <li>Identity information, including photographs, nationality and national identification details.</li>
              <li>Information about how you interact with us, including channels used, location, software and complaints.</li>
              <li>Information required to meet legal and regulatory obligations.</li>
              <li>Information captured in forms, telephone conversations or correspondence.</li>
              <li>Cookies and similar technologies used to remember preferences and tailor content.</li>
              <li>Information about parties involved in transactions, arrangements or contracts.</li>
              <li>Photographs or videos captured by CCTV in and around our facilities.</li>
              <li>Confidential information provided or generated during the course of our services.</li>
            </ul>
            <p className="mt-5">
              We will obtain consent before sharing personal data with a third party unless this is necessary to provide our services or required by applicable law.
            </p>

            <h2 id="how-we-use-information" className="mt-12 font-serif text-3xl leading-tight text-ink md:text-4xl">
              4. How we use information
            </h2>
            <p className="mt-5">
              We use information only where permitted by law and for the purposes described below:
            </p>
            <ul className="mt-5 list-disc space-y-2 pl-6">
              <li>To represent your interests and provide legal and related services.</li>
              <li>To respond to questions, enquiries and service requests.</li>
              <li>To improve our services, platforms and website content.</li>
              <li>To address inappropriate use of our services.</li>
              <li>To send legal articles, newsletters, notices, news updates, security alerts and administrative messages.</li>
              <li>To verify identity and information supplied by clients or other parties.</li>
              <li>To maintain accurate records, recruit personnel and comply with legal obligations.</li>
              <li>To communicate with you and protect the rights, safety or property of the Firm.</li>
              <li>To enforce our terms, policies and standards.</li>
              <li>To detect and prevent fraud, malicious activity and other illegal conduct.</li>
              <li>To investigate disputes and respond to requests from regulators or law enforcement.</li>
            </ul>

            <h2 id="how-we-protect-information" className="mt-12 font-serif text-3xl leading-tight text-ink md:text-4xl">
              5. How we protect information
            </h2>
            <p className="mt-5">
              We use physical, technical and administrative security controls to protect the integrity and confidentiality of personal data and reduce the risk of loss, misuse, unauthorised access, disclosure or alteration.
            </p>
            <p className="mt-4">
              Our security measures include encryption, firewalls, physical access controls and limited access to records. Only employees with a legitimate need may access personal data, and they must not use it for private or commercial purposes or disclose it to unauthorised persons.
            </p>

            <h2 id="data-processing-principles" className="mt-12 font-serif text-3xl leading-tight text-ink md:text-4xl">
              6. Data processing principles
            </h2>
            <ul className="mt-5 list-disc space-y-2 pl-6">
              <li>We collect and process data for specific, legitimate and lawful purposes.</li>
              <li>We process data accurately and fairly.</li>
              <li>We store data only for as long as reasonably necessary and legally permissible.</li>
              <li>We protect data against foreseeable risks, including theft, cyber attacks, damage and unauthorised access.</li>
            </ul>

            <h2 id="lawful-bases" className="mt-12 font-serif text-3xl leading-tight text-ink md:text-4xl">
              7. Lawful bases for processing
            </h2>
            <p className="mt-5">
              We process personal data only where permitted by the Nigeria Data Protection Act 2023, the Nigeria Data Protection Regulation 2019 and applicable implementation guidance. We may rely on:
            </p>
            <ul className="mt-5 list-disc space-y-2 pl-6">
              <li>Your consent for one or more specific purposes.</li>
              <li>Performance of a contract with you or steps taken at your request before entering into a contract.</li>
              <li>Compliance with a legal obligation to which we are subject.</li>
              <li>Protection of your vital interests or those of another person.</li>
              <li>Performance of a task in the public interest or exercise of an official public mandate.</li>
              <li>Legitimate interests of the Firm or a third party to whom data is disclosed.</li>
            </ul>
            <p className="mt-5">
              We may rely on more than one lawful basis depending on the specific purpose. Contact us if you need details about the basis used for your personal data.
            </p>

            <h2 id="how-we-share-information" className="mt-12 font-serif text-3xl leading-tight text-ink md:text-4xl">
              8. How we share information
            </h2>
            <p className="mt-5">
              We do not sell, trade or rent personal data to anyone. We may share information with trusted service providers or third parties you have authorised, where necessary to provide our services.
            </p>
            <p className="mt-4">
              We may also disclose information where required by law, including to tax authorities, regulators, law enforcement or other public bodies. Third-party websites linked from our services have their own privacy policies, and we are not responsible for their practices.
            </p>

            <h2 id="international-transfers" className="mt-12 font-serif text-3xl leading-tight text-ink md:text-4xl">
              9. International transfers
            </h2>
            <p className="mt-5">
              Personal data may be transferred outside Nigeria where necessary for our services. We will take appropriate steps to protect it in accordance with applicable law, including confirming whether the destination has adequate data protection laws.
            </p>
            <p className="mt-4">
              We may transfer data outside Nigeria only where your consent has been obtained, the transfer is necessary for a contract or pre-contractual measures, required for legal claims or compliance, necessary for public interest, or required to protect your vital interests or those of another person.
            </p>

            <h2 id="data-retention" className="mt-12 font-serif text-3xl leading-tight text-ink md:text-4xl">
              10. Data retention
            </h2>
            <p className="mt-5">
              We retain personal data for as long as needed to provide our services and comply with legal, regulatory or contractual obligations. We may retain transaction and other records after our services end where required by law or a valid contract.
            </p>
            <p className="mt-4">
              We review records periodically to confirm their accuracy, purpose and continuing need for retention. We will delete or destroy data where possible, unless retention is required by law or necessary to establish, exercise or defend legal claims.
            </p>

            <h2 id="purpose-limitation" className="mt-12 font-serif text-3xl leading-tight text-ink md:text-4xl">
              11. Purpose limitation
            </h2>
            <p className="mt-5">
              We collect personal data only for identified purposes. Where consent is given, data will not be reused for an incompatible purpose without obtaining new consent.
            </p>

            <h2 id="data-minimisation" className="mt-12 font-serif text-3xl leading-tight text-ink md:text-4xl">
              12. Data minimisation
            </h2>
            <p className="mt-5">
              We collect only the personal data that is relevant, adequate and necessary for the purpose for which it is processed. Where possible, anonymised data will be used.
            </p>

            <h2 id="cookies" className="mt-12 font-serif text-3xl leading-tight text-ink md:text-4xl">
              13. Cookies
            </h2>
            <p className="mt-5">
              Cookies are small pieces of data stored by a website in your browser. We use cookies to remember preferences, improve your experience, monitor traffic, prevent fraud and promote trust and safety.
            </p>
            <p className="mt-4">
              Our cookies do not normally store personal or sensitive information. They contain a unique random reference that allows our servers to recognise you and provide relevant content. You can disable cookies in your browser settings, although this may affect your experience on the website.
            </p>

            <h2 id="your-choices-and-rights" className="mt-12 font-serif text-3xl leading-tight text-ink md:text-4xl">
              14. Your choices and rights
            </h2>
            <p className="mt-5">
              Depending on applicable law, you may have the right to request access, correction, erasure, restriction, objection or transfer of your personal data. You may also withdraw consent where processing is based on consent.
            </p>
            <ul className="mt-5 list-disc space-y-2 pl-6">
              <li><strong>Access:</strong> receive a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> request correction or completion of inaccurate information.</li>
              <li><strong>Erasure:</strong> request deletion where there is no good reason to continue processing.</li>
              <li><strong>Objection:</strong> object to processing based on legitimate interests or direct marketing.</li>
              <li><strong>Restriction:</strong> request suspension of processing in specified circumstances.</li>
              <li><strong>Transfer:</strong> request your data in a structured, commonly used, machine-readable format.</li>
              <li><strong>Withdrawal:</strong> withdraw consent where processing is based on consent.</li>
            </ul>
            <p className="mt-5">
              A request may require additional information to confirm your identity. We may charge a reasonable fee where a request is unfounded, repetitive or excessive. We may also refuse a request where permitted by law.
            </p>

            <h2 id="regulatory-compliance" className="mt-12 font-serif text-3xl leading-tight text-ink md:text-4xl">
              15. Regulatory compliance
            </h2>
            <p className="mt-5">
              We comply with the Nigerian data protection laws and regulations that apply to our activities, including the Constitution, Nigeria Data Protection Act 2023, Nigeria Data Protection Regulation 2019, implementation guidance, cybercrime law, competition and consumer protection law, freedom of information law and the NBA Cybersecurity Guideline.
            </p>

            <h2 id="updates" className="mt-12 font-serif text-3xl leading-tight text-ink md:text-4xl">
              16. Updates to this Policy
            </h2>
            <p className="mt-5">
              We may update, modify, change or revise this Privacy Policy from time to time. The current version will always be available on this page and will govern our relationship with you. We recommend checking this page regularly.
            </p>
            <p className="mt-4">
              By continuing to use our services after changes take effect, you agree to be bound by the revised Policy. Please keep us informed if your personal data changes.
            </p>

            <h2 id="complaints-and-remedies" className="mt-12 font-serif text-3xl leading-tight text-ink md:text-4xl">
              17. Complaints and remedies
            </h2>
            <p className="mt-5">
              If you believe that this Policy or your privacy rights have been violated, contact our Data Protection Officer at <a href="mailto:dataprivacy@spaajibade.com" className="font-medium text-cobalt underline underline-offset-2">dataprivacy@spaajibade.com</a> or <a href="mailto:fokoro@spaajibade.com" className="font-medium text-cobalt underline underline-offset-2">fokoro@spaajibade.com</a>.
            </p>
            <p className="mt-4">
              You may also complain to the Nigeria Data Protection Commission at No 12 Clement Isong Street, Asokoro, Abuja, Nigeria or <a href="mailto:info@ndpc.gov.ng" className="font-medium text-cobalt underline underline-offset-2">info@ndpc.gov.ng</a>. We will notify the Commission of a breach within 72 hours of becoming aware of it, where required by law.
            </p>

            <h2 id="questions-and-enquiries" className="mt-12 font-serif text-3xl leading-tight text-ink md:text-4xl">
              18. Questions and enquiries
            </h2>
            <p className="mt-5">
              For questions about this Policy or your data protection rights, contact our Data Protection Officer at <a href="mailto:dataprivacy@spaajibade.com" className="font-medium text-cobalt underline underline-offset-2">dataprivacy@spaajibade.com</a>, <a href="mailto:fokoro@spaajibade.com" className="font-medium text-cobalt underline underline-offset-2">fokoro@spaajibade.com</a> or <a href="mailto:lagosoffice@spaajibade.com" className="font-medium text-cobalt underline underline-offset-2">lagosoffice@spaajibade.com</a>.
            </p>
            <p className="mt-4">
              If you are in Lagos, you can also reach us at Suite 201, 27A Macarthy Street, Onikan, Lagos.
            </p>

            <h2 id="glossary" className="mt-12 font-serif text-3xl leading-tight text-ink md:text-4xl">
              19. Glossary
            </h2>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-140 border-collapse text-sm leading-6">
                <thead>
                  <tr className="border-b border-ink bg-mist">
                    <th className="px-4 py-3 text-left font-semibold text-ink">Term</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink">Definition</th>
                  </tr>
                </thead>
                <tbody>
                  {glossary.map(([term, definition]) => (
                    <tr key={term} className="border-b border-mist-200">
                      <th className="px-4 py-3 text-left font-semibold text-ink">{term}</th>
                      <td className="px-4 py-3 text-left text-ink-800">{definition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-8 border-t border-mist-200 pt-6 text-sm text-stone">
              Last updated: 17 October 2024
            </p>
          </div>
        </div>
      </section>
      <PageEnd faq={false} />
    </>
  );
}

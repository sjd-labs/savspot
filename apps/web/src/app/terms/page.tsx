import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | SavSpot',
  description:
    'Terms governing access to and use of the SavSpot booking platform.',
};

const EFFECTIVE_DATE = 'May 22, 2026';
const SUPPORT_EMAIL = 'support@savspot.co';
const LEGAL_EMAIL = 'legal@savspot.co';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <nav className="mx-auto flex h-16 max-w-4xl items-center px-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            SavSpot
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Effective date: {EFFECTIVE_DATE}
        </p>

        <aside className="mt-6 rounded-md border border-foreground/20 bg-foreground/5 p-4 text-sm">
          <strong className="font-semibold">Please read carefully.</strong>{' '}
          These Terms include a binding-arbitration agreement (Section 19), a
          waiver of the right to participate in class actions (Section 19.3),
          and limitations of liability (Section 17). By using SavSpot you
          agree to be bound by these Terms.
        </aside>

        <section className="prose prose-neutral dark:prose-invert mt-8 max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            These Terms of Service (&ldquo;<strong>Terms</strong>&rdquo;)
            constitute a binding agreement between you and{' '}
            <strong>SJD Labs, LLC</strong>, a California limited liability
            company doing business as &ldquo;<strong>SavSpot</strong>&rdquo;
            (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;),
            governing access to and use of the SavSpot booking platform,
            including the website at <code>www.savspot.co</code>, the API at{' '}
            <code>api.savspot.co</code>, hosted booking pages, mobile apps,
            embeds, and related services (collectively, the
            &ldquo;<strong>Service</strong>&rdquo;).
          </p>
          <p>
            By creating an account, clicking &ldquo;I agree,&rdquo; or
            otherwise using the Service, you accept these Terms and our{' '}
            <Link href="/privacy">Privacy Policy</Link>. If you do not agree,
            do not use the Service.
          </p>

          <h2>2. Definitions</h2>
          <ul>
            <li>
              &ldquo;<strong>Tenant</strong>&rdquo; means a business that uses
              the Service to manage bookings and serve its own customers.
            </li>
            <li>
              &ldquo;<strong>Client</strong>&rdquo; means an end consumer who
              books appointments or services through a Tenant&rsquo;s SavSpot
              page.
            </li>
            <li>
              &ldquo;<strong>You</strong>&rdquo; and &ldquo;<strong>your</strong>&rdquo;
              refer to the natural person accepting these Terms and, where
              applicable, the legal entity on whose behalf that person acts.
            </li>
            <li>
              &ldquo;<strong>User Content</strong>&rdquo; means any data, text,
              files, images, or other content you upload, transmit through, or
              create within the Service, including Client records.
            </li>
            <li>
              &ldquo;<strong>Subscription</strong>&rdquo; means a paid
              subscription tier (Starter, Team, Business, or successor tier)
              that grants access to the Service.
            </li>
          </ul>

          <h2>3. Eligibility</h2>
          <p>
            You must be at least 18 years old and able to form a binding
            contract under applicable law to use the Service. If you are
            using the Service on behalf of an organization, you represent
            that you have authority to bind that organization to these
            Terms. The Service is not available to users previously suspended
            or removed from the Service.
          </p>

          <h2>4. Account terms</h2>
          <p>
            You are responsible for (a) providing accurate and current
            information at sign-up; (b) maintaining the confidentiality of
            your credentials, API keys, and any access tokens; (c) all
            activity that occurs under your account, whether or not
            authorized; and (d) notifying us promptly at{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> of any
            suspected unauthorized access. We are not liable for losses
            caused by your failure to maintain credential security.
          </p>

          <h2>5. Subscription, billing, and taxes</h2>

          <h3>5.1 Automatic renewal &mdash; clear and conspicuous notice</h3>
          <p>
            <strong>
              YOUR SUBSCRIPTION WILL AUTOMATICALLY RENEW AT THE END OF EACH
              BILLING PERIOD AT THE THEN-CURRENT PRICE AND CHARGE THE PAYMENT
              METHOD ON FILE UNTIL YOU CANCEL. YOU MAY CANCEL AT ANY TIME
              FROM YOUR ACCOUNT SETTINGS PAGE OR BY EMAILING{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>; THE
              CANCELLATION TAKES EFFECT AT THE END OF THE THEN-CURRENT
              BILLING PERIOD AND THERE IS NO PENALTY OR CANCELLATION FEE.
            </strong>{' '}
            This notice is provided in compliance with California Business and
            Professions Code §§17600&ndash;17606.
          </p>

          <h3>5.2 Payment processing</h3>
          <p>
            Paid Subscriptions are processed through Stripe under the plans
            listed at <Link href="/pricing">/pricing</Link>. By subscribing
            you authorize us (and Stripe on our behalf) to charge your
            payment method, on a recurring basis, the applicable fees and
            taxes until you cancel.
          </p>

          <h3>5.3 Price changes</h3>
          <p>
            We may change prices for any Subscription with at least 30
            days&rsquo; prior notice by email. The change takes effect at
            your next renewal; if you do not agree, you may cancel before
            that renewal as described in Section 5.1.
          </p>

          <h3>5.4 Taxes</h3>
          <p>
            Fees are exclusive of taxes. You are responsible for any sales
            tax, VAT, GST, withholding tax, or similar taxes other than taxes
            on our net income. Where we are required to collect such taxes
            we will add them to your invoice.
          </p>

          <h3>5.5 Payment processing fees</h3>
          <p>
            Fees you collect from your Clients through Stripe Connect are
            subject to Stripe&rsquo;s payment-processing fees and our
            platform fee, as disclosed at sign-up.
          </p>

          <h3>5.6 Failed payments</h3>
          <p>
            If a payment fails, we may retry the charge, suspend access, or
            terminate the Service after reasonable notice.
          </p>

          <h2>6. Free trials, cancellation, and refunds</h2>
          <p>
            Any free trial converts to a paid Subscription automatically at
            the end of the trial period unless you cancel before then. We
            will send a reminder before the trial ends, and you may cancel
            during the trial without charge from your account settings.
          </p>
          <p>
            Except where required by applicable law (including California
            Business and Professions Code §17602(b) for annual trials), all
            fees are non-refundable and we do not provide refunds or credits
            for partial Subscription periods, unused features, or downgrades.
          </p>

          <h2>7. Acceptable use</h2>
          <p>You will not, and will not permit any third party to:</p>
          <ul>
            <li>
              violate any applicable law or regulation, infringe any
              intellectual-property or privacy right, or use the Service for
              any unlawful, harmful, fraudulent, or deceptive purpose;
            </li>
            <li>
              upload or transmit malware, viruses, worms, or any code
              designed to disrupt or compromise the Service;
            </li>
            <li>
              attempt to access, probe, or scan systems or accounts that you
              are not authorized to access; bypass or circumvent any
              authentication, rate limit, or access control; reverse engineer
              the Service except to the limited extent allowed by mandatory
              law;
            </li>
            <li>
              scrape, harvest, spider, or otherwise extract data from the
              Service except through documented public APIs at the documented
              rate limits;
            </li>
            <li>
              send unsolicited communications, spam, or any content that is
              defamatory, obscene, harassing, hateful, threatening, or that
              promotes violence or discrimination;
            </li>
            <li>
              use the Service to operate or facilitate a business that
              competes with SavSpot;
            </li>
            <li>
              resell, sublicense, white-label, or otherwise commercialize the
              Service except through features explicitly offered for that
              purpose;
            </li>
            <li>
              use the Service to collect personal information from minors
              without verifiable parental consent where required.
            </li>
          </ul>
          <p>
            We may suspend or terminate access to the Service for any
            violation of this Section without prior notice.
          </p>

          <h2>8. User Content and Client data</h2>
          <p>
            You retain ownership of User Content you upload to the Service.
            You grant us a worldwide, non-exclusive, royalty-free license to
            host, copy, transmit, display, and process User Content solely to
            provide and improve the Service, secure it against abuse, comply
            with law, and produce aggregated, de-identified analytics.
          </p>
          <p>You represent and warrant that:</p>
          <ul>
            <li>
              you own or have all necessary rights, licenses, and consents to
              upload the User Content and to grant the license above;
            </li>
            <li>
              the User Content does not violate any law, contract, or
              third-party right;
            </li>
            <li>
              you have provided notice and obtained any consents required
              under applicable privacy law (including the GDPR, the CCPA, and
              equivalent regimes) to enter Client personal information into
              the Service;
            </li>
            <li>
              you will respond to Client data-subject requests as the data
              controller for that Client data and will not direct SavSpot to
              process Client data in violation of applicable law.
            </li>
          </ul>
          <p>
            Our Data Processing Addendum (available on request to{' '}
            <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>) governs our
            role as a processor of Client personal information.
          </p>

          <h2>9. SavSpot intellectual property</h2>
          <p>
            The Service, including all software, designs, trademarks, logos,
            text, graphics, and other content (except User Content and
            third-party content), is owned by SJD Labs, LLC or its licensors
            and is protected by intellectual-property laws. Except for the
            limited license granted in Section 10, no rights are granted to
            you by implication, estoppel, or otherwise.
          </p>

          <h2>10. License to use the Service</h2>
          <p>
            Subject to your compliance with these Terms and timely payment of
            applicable fees, we grant you a limited, non-exclusive,
            non-transferable, non-sublicensable, revocable license to access
            and use the Service for your internal business purposes during
            your Subscription term. This license terminates automatically on
            termination of these Terms or your Subscription.
          </p>

          <h2>11. Open source and Enterprise Edition</h2>
          <p>
            The core SavSpot platform source code is published under the GNU
            Affero General Public License v3.0 (AGPL-3.0). Self-hosting and
            redistribution are governed by that license. The Enterprise
            Edition modules located at <code>packages/ee/</code> are{' '}
            <em>not</em> covered by the AGPL and are licensed separately
            under a commercial license. Use of Enterprise Edition features
            requires a valid commercial license key. These Terms govern your
            use of the hosted Service operated at <code>savspot.co</code>{' '}
            regardless of any open-source license you have for the source
            code.
          </p>

          <h2>12. Service availability and changes</h2>
          <p>
            We use commercially reasonable efforts to keep the Service
            available, but we do not guarantee uninterrupted availability.
            We do not currently offer an uptime SLA on standard plans.
            Maintenance windows, third-party outages (including Stripe,
            Supabase, Vercel, Resend, Twilio), and acts of God may cause
            interruptions. We may modify, suspend, or discontinue features
            with reasonable notice for material changes.
          </p>

          <h2>13. Third-party services</h2>
          <p>
            The Service integrates with third-party services including
            Stripe, Supabase, Vercel, Resend, Twilio, Google, Apple, Sentry,
            and PostHog. Your use of those services is governed by their
            respective terms, and we are not responsible for their acts,
            omissions, downtime, or content. Where you authorize a
            third-party integration we may share with that service only the
            data necessary to operate it.
          </p>

          <h2>14. Beta and preview features</h2>
          <p>
            We may offer features marked &ldquo;beta,&rdquo; &ldquo;preview,&rdquo;
            or similar. Such features are provided{' '}
            <strong>&ldquo;as-is&rdquo;</strong> without any warranties, may be
            withdrawn at any time, and are not covered by any SLA or support
            commitment.
          </p>

          <h2>15. Notice and procedure for copyright claims (DMCA)</h2>
          <p>
            We respect intellectual-property rights. If you believe content
            on the Service infringes your copyright, send a notice under the
            Digital Millennium Copyright Act (17 U.S.C. §512) to{' '}
            <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a> with the
            subject &ldquo;DMCA Notice&rdquo; that includes: (a)
            identification of the copyrighted work; (b) identification of the
            infringing material and its location on the Service; (c) your
            contact information; (d) a statement that you have a good-faith
            belief that the use is not authorized; (e) a statement under
            penalty of perjury that the information is accurate and you are
            authorized to act on behalf of the copyright owner; and (f) your
            physical or electronic signature. Counter-notices may be sent to
            the same address.
          </p>

          <h2>16. Disclaimers</h2>
          <p>
            <strong>
              THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS
              AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED
              WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
              PURPOSE, TITLE, AND NON-INFRINGEMENT.
            </strong>{' '}
            We do not warrant that the Service will meet your requirements,
            be uninterrupted, secure, error-free, or that defects will be
            corrected. To the maximum extent permitted by law, all
            warranties not expressly granted in these Terms are disclaimed.
            Nothing in this Section excludes or limits any warranty or
            condition implied by law that cannot lawfully be excluded.
          </p>

          <h2>17. Limitation of liability</h2>
          <p>
            <strong>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT
              WILL SAVSPOT, ITS AFFILIATES, OR ITS LICENSORS BE LIABLE FOR
              ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY,
              OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, REVENUE,
              GOODWILL, DATA, OR BUSINESS OPPORTUNITIES, ARISING OUT OF OR
              RELATED TO THESE TERMS OR THE SERVICE, EVEN IF WE HAVE BEEN
              ADVISED OF THE POSSIBILITY OF SUCH DAMAGES AND EVEN IF A
              REMEDY FAILS OF ITS ESSENTIAL PURPOSE.
            </strong>
          </p>
          <p>
            <strong>
              OUR AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR
              RELATED TO THESE TERMS OR THE SERVICE WILL NOT EXCEED THE
              GREATER OF (A) THE AMOUNTS YOU PAID TO SAVSPOT IN THE TWELVE
              (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR
              (B) ONE HUNDRED U.S. DOLLARS ($100).
            </strong>
          </p>
          <p>
            <strong>
              Nothing in this Section limits or excludes liability that
              cannot be limited or excluded under applicable law,
              including: (a) liability under California Civil Code §1668 for
              fraud, willful injury, or violation of law, whether willful or
              negligent; (b) liability for gross negligence; (c) liability
              for death or personal injury caused by negligence; or (d)
              liability that cannot be excluded under mandatory
              consumer-protection law.
            </strong>{' '}
            Some jurisdictions do not allow the exclusion or limitation of
            certain damages, so the above limitations may not apply to you
            in full; in that case our liability is limited to the maximum
            extent permitted by law.
          </p>

          <h2>18. Indemnification</h2>
          <p>
            You will defend, indemnify, and hold harmless SavSpot, its
            affiliates, and their respective officers, directors, employees,
            and agents from and against any and all claims, damages,
            liabilities, losses, costs, and expenses (including reasonable
            attorneys&rsquo; fees) arising out of or related to (a) your
            access to or use of the Service; (b) your User Content; (c) your
            violation of these Terms; (d) your violation of any law or any
            third-party right (including any privacy or intellectual-property
            right of any Client or other person); and (e) the operation of
            your business through the Service. We will provide you with
            prompt notice of any such claim; you may not settle any such
            claim without our prior written consent if the settlement
            imposes any obligation on us.
          </p>

          <h2>19. Dispute resolution and arbitration</h2>

          <h3>19.1 Informal resolution</h3>
          <p>
            Before filing any formal dispute, you and SavSpot agree to try to
            resolve the dispute informally for at least 60 days by emailing{' '}
            <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a> with a
            written description of the dispute and the relief you seek.
          </p>

          <h3>19.2 Binding arbitration</h3>
          <p>
            <strong>
              If informal resolution fails, any dispute, claim, or
              controversy arising out of or related to these Terms or the
              Service will be resolved by final and binding arbitration on
              an individual basis, administered by the American Arbitration
              Association (AAA) under its Commercial Arbitration Rules and
              Consumer Arbitration Rules where applicable. The arbitration
              will be governed by the Federal Arbitration Act (9 U.S.C.
              §§1&ndash;16) and seated in Los Angeles County, California,
              or, where permitted, conducted by video conference. Judgment
              on the award may be entered in any court of competent
              jurisdiction.
            </strong>
          </p>

          <h3>19.3 Class-action and jury waiver</h3>
          <p>
            <strong>
              YOU AND SAVSPOT EACH WAIVE THE RIGHT TO A TRIAL BY JURY AND THE
              RIGHT TO PARTICIPATE IN ANY CLASS, CONSOLIDATED, OR
              REPRESENTATIVE ACTION. THE ARBITRATOR MAY NOT CONSOLIDATE
              CLAIMS OF DIFFERENT USERS AND MAY NOT PRESIDE OVER ANY FORM OF
              CLASS PROCEEDING.
            </strong>{' '}
            If this waiver is held unenforceable as to any claim, that
            claim will be litigated in the state and federal courts
            located in Los Angeles County, California, but the remainder
            of this arbitration agreement will remain in effect.
          </p>

          <h3>19.4 Exceptions</h3>
          <p>
            This Section does not prevent either party from (a) bringing an
            individual claim in California small-claims court for claims
            that qualify under California Code of Civil Procedure §116.220
            et seq.; or (b) seeking injunctive or other equitable relief in
            court to stop unauthorized use of the Service, infringement of
            intellectual-property rights, or breach of confidentiality.
          </p>

          <h3>19.5 30-day right to opt out</h3>
          <p>
            You may opt out of the arbitration agreement and class-action
            waiver in Sections 19.2 and 19.3 by emailing{' '}
            <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a> within 30
            days of first accepting these Terms, with the subject line
            &ldquo;Arbitration opt-out&rdquo; and your name, email, and
            account identifier. Opting out will not affect any other part
            of these Terms.
          </p>

          <h2>20. Governing law and venue</h2>
          <p>
            These Terms are governed by the laws of the State of California,
            without regard to its conflict-of-laws principles. Subject to
            Section 19, the state and federal courts located in Los Angeles
            County, California, have exclusive jurisdiction over any matter
            not subject to arbitration, and you consent to personal
            jurisdiction and venue there. The United Nations Convention on
            Contracts for the International Sale of Goods does not apply.
          </p>

          <h2>21. California consumer notice</h2>
          <p>
            Under California Civil Code §1789.3, California users may
            contact the Complaint Assistance Unit of the Division of
            Consumer Services of the California Department of Consumer
            Affairs in writing at 1625 North Market Boulevard, Suite N 112,
            Sacramento, CA 95834, or by telephone at (916) 445-1254 or
            (800) 952-5210.
          </p>

          <h2>22. Termination</h2>
          <p>
            You may terminate these Terms at any time by closing your
            account. We may suspend or terminate your access to the Service
            (a) immediately if you materially breach these Terms; (b) with
            30 days&rsquo; notice for convenience; or (c) immediately if we
            reasonably believe continued provision creates a legal or
            security risk. On termination, your license to the Service ends
            and we may delete your User Content after a reasonable retention
            period as described in our{' '}
            <Link href="/privacy">Privacy Policy</Link>. Sections that by
            their nature should survive termination (including Sections 8,
            9, 16, 17, 18, 19, 20, and 21) survive.
          </p>

          <h2>23. Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time. When we do, we will
            update the &ldquo;Effective date&rdquo; above and, for material
            changes, provide additional notice (such as an in-product banner
            or email) at least 30 days before the change takes effect.
            Continued use of the Service after the effective date of an
            updated version constitutes acceptance of the changes. If you do
            not agree to a material change, stop using the Service and
            cancel your Subscription before the effective date.
          </p>

          <h2>24. Notices</h2>
          <p>
            We may send notices to you via the email associated with your
            account or by posting in the Service. You must send legal
            notices to{' '}
            <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>. A mailing
            address for certified mail is available on written request to
            the same address.
          </p>

          <h2>25. Assignment</h2>
          <p>
            You may not assign these Terms or any rights under them without
            our prior written consent; any attempt to do so is void. We may
            assign these Terms without notice in connection with a merger,
            acquisition, financing, or sale of assets.
          </p>

          <h2>26. Force majeure</h2>
          <p>
            We are not liable for any delay or failure to perform caused by
            events beyond our reasonable control, including acts of God,
            war, terrorism, riots, fire, flood, pandemic, governmental
            action, labor disputes, internet or telecommunications failures,
            or failures of upstream service providers.
          </p>

          <h2>27. Severability, waiver, entire agreement</h2>
          <p>
            If any provision of these Terms is held unenforceable, that
            provision will be enforced to the maximum extent permitted (and
            the arbitration agreement reformed only to the minimum extent
            necessary to be enforceable) and the remaining provisions will
            remain in full force. Failure to enforce any provision is not a
            waiver. These Terms, together with the{' '}
            <Link href="/privacy">Privacy Policy</Link> and any other
            agreements expressly incorporated by reference, constitute the
            entire agreement between you and SavSpot regarding the Service
            and supersede all prior agreements on the same subject.
          </p>

          <h2>28. Contact</h2>
          <p>
            Legal notices:{' '}
            <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>
            <br />
            General support:{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            <br />
            SJD Labs, LLC &mdash; California, USA. Mailing address available
            on written request to{' '}
            <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>.
          </p>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-4xl items-center gap-6 px-4">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Home
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}

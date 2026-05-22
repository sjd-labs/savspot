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

        <aside
          className="mt-6 rounded-md border border-amber-500/50 bg-amber-500/10 p-4 text-sm"
          role="note"
        >
          <strong className="font-semibold">Template notice.</strong> This
          document is a starting-point template that reflects the
          platform&rsquo;s actual operations but is not legal advice. Have it
          reviewed by qualified counsel admitted in your jurisdiction before
          relying on it. Update the placeholders for legal-entity name,
          registered address, and governing-law jurisdiction to match your
          business. Mandatory-arbitration and class-action-waiver clauses are
          unenforceable in some jurisdictions and against certain claims;
          ensure they conform to your local law.
        </aside>

        <aside className="mt-4 rounded-md border border-foreground/20 bg-foreground/5 p-4 text-sm">
          <strong className="font-semibold">Please read carefully.</strong>{' '}
          These Terms include a binding-arbitration agreement, a waiver of the
          right to participate in class actions, and limitations of liability.
          By using SavSpot you agree to be bound by these Terms.
        </aside>

        <section className="prose prose-neutral dark:prose-invert mt-8 max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            These Terms of Service (&ldquo;<strong>Terms</strong>&rdquo;)
            constitute a binding agreement between you and{' '}
            <strong>[Your Legal Entity Name]</strong> (&ldquo;<strong>SavSpot</strong>,&rdquo;
            &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) governing
            access to and use of the SavSpot booking platform, including the
            website at <code>www.savspot.co</code>, the API at{' '}
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
            You must be at least 18 years old (or the age of majority in your
            jurisdiction) and able to form a binding contract under applicable
            law to use the Service. If you are using the Service on behalf of
            an organization, you represent that you have authority to bind
            that organization to these Terms. The Service is not available to
            users previously suspended or removed from the Service.
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
          <p>
            Paid Subscriptions are processed through Stripe under the plans
            listed at <Link href="/pricing">/pricing</Link>. By subscribing
            you authorize us (and Stripe on our behalf) to charge your
            payment method, on a recurring basis, the applicable fees and
            taxes until you cancel.
          </p>
          <ul>
            <li>
              <strong>Auto-renewal.</strong> Subscriptions renew automatically
              at the end of each billing period at the then-current price.
              You may cancel at any time from your account settings; the
              cancellation takes effect at the end of the current billing
              period.
            </li>
            <li>
              <strong>Price changes.</strong> We may change prices for any
              Subscription with at least 30 days&rsquo; prior notice. The
              change takes effect at your next renewal; if you do not agree,
              you may cancel before that renewal.
            </li>
            <li>
              <strong>Taxes.</strong> Fees are exclusive of taxes. You are
              responsible for any sales tax, VAT, GST, withholding tax, or
              similar taxes other than taxes on our net income. Where we are
              required to collect such taxes we will add them to your
              invoice.
            </li>
            <li>
              <strong>Payment processing fees.</strong> Fees you collect from
              your Clients through Stripe Connect are subject to
              Stripe&rsquo;s payment-processing fees and our platform fee, as
              disclosed at sign-up.
            </li>
            <li>
              <strong>Failed payments.</strong> If a payment fails, we may
              retry the charge, suspend access, or terminate the Service
              after reasonable notice.
            </li>
          </ul>

          <h2>6. Free trials, cancellation, and refunds</h2>
          <p>
            Any free trial converts to a paid Subscription automatically at
            the end of the trial period unless you cancel before then.
          </p>
          <p>
            Except where required by applicable law, all fees are
            non-refundable and we do not provide refunds or credits for
            partial Subscription periods, unused features, or downgrades.
            Where mandatory consumer-protection law grants you a right of
            withdrawal, that right applies and supersedes this provision.
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
              under applicable privacy law (including GDPR, CCPA, and
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
            third-party content), is owned by SavSpot or its licensors and
            is protected by intellectual-property laws. Except for the
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

          <h2>15. Disclaimers</h2>
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
          </p>

          <h2>16. Indemnification</h2>
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
            </strong>{' '}
            Some jurisdictions do not allow the exclusion or limitation of
            certain damages, so these limitations may not apply to you in
            whole; in that case our liability is limited to the maximum
            extent permitted by law.
          </p>

          <h2>18. Termination</h2>
          <p>
            You may terminate these Terms at any time by closing your
            account. We may suspend or terminate your access to the Service
            (a) immediately if you materially breach these Terms; (b) with
            30 days&rsquo; notice for convenience; or (c) immediately if we
            reasonably believe continued provision creates a legal or
            security risk. On termination, your license to the Service ends
            and we may delete your User Content after a reasonable retention
            period as described in our Privacy Policy. Sections that by their
            nature should survive termination (including Sections 8, 9, 15,
            16, 17, 19, and 20) survive.
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
              will be conducted in <strong>[Your Jurisdiction, e.g.
              Delaware, USA]</strong> or, where permitted, by video
              conference. Judgment on the award may be entered in any court
              of competent jurisdiction.
            </strong>
          </p>

          <h3>19.3 Class-action waiver</h3>
          <p>
            <strong>
              YOU AND SAVSPOT EACH WAIVE THE RIGHT TO A TRIAL BY JURY AND THE
              RIGHT TO PARTICIPATE IN ANY CLASS, CONSOLIDATED, OR
              REPRESENTATIVE ACTION. THE ARBITRATOR MAY NOT CONSOLIDATE
              CLAIMS OF DIFFERENT USERS AND MAY NOT PRESIDE OVER ANY FORM OF
              CLASS PROCEEDING.
            </strong>{' '}
            If this waiver is held unenforceable as to any claim, that
            claim will be litigated in court, but the remainder of this
            arbitration agreement will remain in effect.
          </p>

          <h3>19.4 Exceptions</h3>
          <p>
            This Section does not prevent either party from (a) bringing an
            individual claim in small-claims court for claims that qualify;
            or (b) seeking injunctive or other equitable relief in court to
            stop unauthorized use of the Service, infringement of
            intellectual-property rights, or breach of confidentiality.
          </p>

          <h3>19.5 Opt-out</h3>
          <p>
            You may opt out of the arbitration agreement and class-action
            waiver by emailing{' '}
            <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a> within 30
            days of first accepting these Terms, with the subject line
            &ldquo;Arbitration opt-out&rdquo; and your name, email, and
            account identifier.
          </p>

          <h2>20. Governing law</h2>
          <p>
            These Terms are governed by the laws of{' '}
            <strong>[Your Jurisdiction]</strong>, without regard to its
            conflict-of-laws principles. Subject to Section 19, the state
            and federal courts located in{' '}
            <strong>[Your Jurisdiction]</strong> have exclusive jurisdiction
            over any matter not subject to arbitration, and you consent to
            personal jurisdiction and venue there. The United Nations
            Convention on Contracts for the International Sale of Goods does
            not apply.
          </p>

          <h2>21. Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time. When we do, we will
            update the &ldquo;Effective date&rdquo; above and, for material
            changes, provide additional notice (such as an in-product banner
            or email). Continued use of the Service after the effective date
            of an updated version constitutes acceptance of the changes. If
            you do not agree to a material change, stop using the Service
            and cancel your Subscription before the effective date.
          </p>

          <h2>22. Notices</h2>
          <p>
            We may send notices to you via the email associated with your
            account or by posting in the Service. You must send legal
            notices to{' '}
            <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a> and by
            certified mail to{' '}
            <strong>[Your Registered Address]</strong>.
          </p>

          <h2>23. Assignment</h2>
          <p>
            You may not assign these Terms or any rights under them without
            our prior written consent; any attempt to do so is void. We may
            assign these Terms without notice in connection with a merger,
            acquisition, financing, or sale of assets.
          </p>

          <h2>24. Force majeure</h2>
          <p>
            We are not liable for any delay or failure to perform caused by
            events beyond our reasonable control, including acts of God,
            war, terrorism, riots, fire, flood, pandemic, governmental
            action, labor disputes, internet or telecommunications failures,
            or failures of upstream service providers.
          </p>

          <h2>25. Severability, waiver, entire agreement</h2>
          <p>
            If any provision of these Terms is held unenforceable, that
            provision will be enforced to the maximum extent permitted and
            the remaining provisions will remain in full force. Failure to
            enforce any provision is not a waiver. These Terms, together
            with the <Link href="/privacy">Privacy Policy</Link> and any
            other agreements expressly incorporated by reference, constitute
            the entire agreement between you and SavSpot regarding the
            Service and supersede all prior agreements on the same subject.
          </p>

          <h2>26. Contact</h2>
          <p>
            Legal notices:{' '}
            <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>
            <br />
            General support:{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            <br />
            Postal: [Your Registered Address]
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

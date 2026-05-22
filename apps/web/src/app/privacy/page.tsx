import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | SavSpot',
  description: 'How SavSpot collects, uses, and protects personal information.',
};

const EFFECTIVE_DATE = 'May 22, 2026';
const SUPPORT_EMAIL = 'support@savspot.co';
const PRIVACY_EMAIL = 'privacy@savspot.co';

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Effective date: {EFFECTIVE_DATE}
        </p>

        <section className="prose prose-neutral dark:prose-invert mt-8 max-w-none">
          <h2>1. Introduction</h2>
          <p>
            This Privacy Policy explains how <strong>SavSpot</strong>{' '}
            (&ldquo;SavSpot,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;our&rdquo;), operated by <strong>SJD Labs, LLC</strong>, a
            California limited liability company, collects, uses, discloses,
            and protects personal information when you visit{' '}
            <code>www.savspot.co</code>, create an account, use the SavSpot
            booking platform, or otherwise interact with our services
            (collectively, the &ldquo;Service&rdquo;).
          </p>
          <p>
            SavSpot is a multi-tenant SaaS booking platform. Service businesses
            (&ldquo;Tenants&rdquo;) use the Service to run their booking
            operations; the customers of those businesses (&ldquo;Clients&rdquo;)
            book appointments and services through Tenant-branded pages. We
            process personal information about both Tenants and Clients, and our
            relationship to that data depends on whose information it is &mdash;
            see Section 9 for how we handle Tenant vs. Client data.
          </p>

          <h2>2. At-a-glance summary</h2>
          <ul>
            <li>
              We collect what you give us when you sign up, configure a booking
              page, book an appointment, or contact support.
            </li>
            <li>
              We collect technical data (IP address, device, cookies) needed to
              keep you logged in, prevent abuse, and measure aggregate usage.
            </li>
            <li>
              We use sub-processors for payments (Stripe), email (Resend), SMS
              (Twilio), authentication and database (Supabase), hosting
              (Vercel), error reporting (Sentry), and product analytics
              (PostHog). We do not sell or share personal information.
            </li>
            <li>
              You can access, correct, export, or delete your personal
              information &mdash; see Sections 11 and 12.
            </li>
            <li>
              When a Tenant uses SavSpot to serve their Clients, the Tenant is
              the controller of that Client data and we are a processor acting
              on the Tenant&rsquo;s instructions.
            </li>
            <li>
              California residents have additional rights under the CCPA / CPRA
              &mdash; see Section 12.
            </li>
          </ul>

          <h2>3. Who we are and how to contact us</h2>
          <p>
            The data controller for personal information collected through the
            Service is <strong>SJD Labs, LLC</strong>, a California limited
            liability company. Privacy requests (access, correction,
            deletion, opt-out, or complaints) should go to{' '}
            <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>. General
            support is at{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Postal
            mail:
          </p>
          <address className="not-italic">
            SJD Labs, LLC<br />
            4653 Carmel Mountain Rd, Ste 308 #AA229<br />
            San Diego, CA 92130<br />
            United States
          </address>

          <h2>4. Information we collect</h2>

          <h3>4.1 Information you provide directly</h3>
          <ul>
            <li>
              <strong>Account information</strong> &mdash; name, email, phone
              number (optional), a hashed copy of your password (we never store
              the plaintext), and your role within your business.
            </li>
            <li>
              <strong>Business profile</strong> &mdash; the business&rsquo;s
              legal and trading names, address, contact email and phone,
              category, logo, cover photo, and any branding text you upload.
            </li>
            <li>
              <strong>Client information you enter</strong> &mdash; names,
              emails, phone numbers, addresses, booking histories, internal
              notes, and any custom fields you create. This data belongs to your
              Tenant (see Section 9).
            </li>
            <li>
              <strong>Booking and transactional data</strong> &mdash; the
              services booked, dates and times, prices, deposits, refunds, and
              payment statuses.
            </li>
            <li>
              <strong>Support communications</strong> &mdash; messages and
              attachments you send to us through email, the help center, or
              chat.
            </li>
          </ul>

          <h3>4.2 Information we collect automatically</h3>
          <ul>
            <li>
              <strong>Authentication and session cookies</strong> &mdash; we set{' '}
              <code>savspot_access</code>, <code>savspot_refresh</code>, and{' '}
              <code>savspot_session</code> cookies to keep you signed in across
              page loads, scoped to <code>.savspot.co</code>. These cookies are
              strictly necessary for the Service to function.
            </li>
            <li>
              <strong>Log data</strong> &mdash; IP address, user-agent string,
              referring URL, timestamps, and the API endpoints you call. Used
              for security, abuse prevention, and operational debugging.
            </li>
            <li>
              <strong>Device data</strong> &mdash; browser, operating system,
              and device type as reported by your browser.
            </li>
            <li>
              <strong>Product analytics</strong> &mdash; PostHog records
              pseudonymous events (which pages you visit, which features you
              use) so we can understand which parts of the Service are valuable.
              No payment data and no Client PII is sent to PostHog.
            </li>
            <li>
              <strong>Error reports</strong> &mdash; Sentry captures stack
              traces and request metadata when something breaks. PII is
              scrubbed from error payloads before transmission to the extent
              technically possible.
            </li>
          </ul>

          <h3>4.3 Information we receive from third parties</h3>
          <ul>
            <li>
              <strong>OAuth providers (Google, Apple)</strong> &mdash; if you
              sign in with Google or Apple, we receive your basic profile
              (name, email, profile picture) and an opaque provider user ID.
              We do not receive your password.
            </li>
            <li>
              <strong>Stripe</strong> &mdash; payment status, the last four
              digits of the card used, the card brand and expiration, and
              Stripe&rsquo;s opaque customer and account identifiers. We do not
              receive or store full card numbers, CVV codes, or bank account
              numbers.
            </li>
            <li>
              <strong>Calendar integrations</strong> &mdash; if you connect a
              Google or Outlook calendar, we read free/busy data and create
              events on your behalf only for accounts you have connected.
            </li>
          </ul>

          <h2>5. How we use information</h2>
          <ul>
            <li>To provide, operate, and maintain the Service.</li>
            <li>
              To process payments, calculate platform fees, and remit funds
              through Stripe Connect.
            </li>
            <li>
              To send transactional communications (booking confirmations,
              reminders, password resets, security alerts). You cannot opt out
              of these because they are essential to the Service.
            </li>
            <li>
              To send service updates and product announcements where permitted
              by law. You can opt out of marketing emails via the unsubscribe
              link or your preference center.
            </li>
            <li>
              To detect, prevent, and investigate fraud, abuse, security
              incidents, and violations of our Terms of Service.
            </li>
            <li>
              To comply with legal obligations and respond to lawful requests
              from authorities.
            </li>
            <li>
              To improve the Service via aggregated, de-identified analytics
              and performance monitoring.
            </li>
          </ul>

          <h2>6. Legal bases for processing (GDPR / UK GDPR)</h2>
          <p>
            Where the GDPR or UK GDPR applies, we rely on the following legal
            bases:
          </p>
          <ul>
            <li>
              <strong>Contract</strong> &mdash; to deliver the Service you have
              signed up for (Article 6(1)(b)).
            </li>
            <li>
              <strong>Legitimate interests</strong> &mdash; to secure the
              Service, prevent abuse, and improve the product, balanced
              against your privacy rights (Article 6(1)(f)).
            </li>
            <li>
              <strong>Consent</strong> &mdash; for non-essential cookies,
              marketing communications, and other optional uses where consent
              is the appropriate basis (Article 6(1)(a)). You may withdraw
              consent at any time.
            </li>
            <li>
              <strong>Legal obligation</strong> &mdash; to comply with
              applicable law, including tax, anti-money-laundering, and
              law-enforcement requirements (Article 6(1)(c)).
            </li>
          </ul>

          <h2>7. How we share information</h2>

          <h3>7.1 Sub-processors</h3>
          <p>
            We use the following sub-processors to deliver the Service. Each
            handles only the data necessary for its function and is bound by
            written agreements that prohibit other use:
          </p>
          <ul>
            <li>
              <strong>Stripe, Inc.</strong> &mdash; payment processing, payouts
              to Tenants via Stripe Connect.
            </li>
            <li>
              <strong>Supabase, Inc.</strong> &mdash; managed PostgreSQL,
              authentication, and object storage for files you upload.
            </li>
            <li>
              <strong>Vercel, Inc.</strong> &mdash; application hosting, edge
              network, log routing.
            </li>
            <li>
              <strong>Resend</strong> &mdash; transactional and marketing
              email delivery.
            </li>
            <li>
              <strong>Twilio Inc.</strong> &mdash; SMS delivery for booking
              reminders and authentication codes.
            </li>
            <li>
              <strong>Sentry</strong> &mdash; application error reporting.
            </li>
            <li>
              <strong>PostHog</strong> &mdash; product analytics.
            </li>
            <li>
              <strong>Google LLC, Apple Inc.</strong> &mdash; OAuth sign-in and
              calendar synchronization (only for accounts you connect).
            </li>
          </ul>
          <p>
            We may add or change sub-processors. Material changes will be
            announced in advance via this page or by email to account owners.
          </p>

          <h3>7.2 Between Tenants and their Clients</h3>
          <p>
            Information you enter as a Tenant is visible to your team members
            you have invited. Booking data and Client information is{' '}
            <em>not</em> shared with other Tenants. Multi-tenant data
            isolation is enforced at the database layer through row-level
            security.
          </p>

          <h3>7.3 Legal compliance and protection</h3>
          <p>
            We may disclose information when we believe in good faith that
            disclosure is necessary to (a) comply with applicable law, court
            orders, subpoenas, or valid governmental requests; (b) enforce our
            Terms of Service; (c) protect the rights, property, or safety of
            SavSpot, our users, or others; or (d) investigate fraud, security,
            or technical issues.
          </p>

          <h3>7.4 Business transfers</h3>
          <p>
            If SavSpot is involved in a merger, acquisition, financing,
            reorganization, bankruptcy, or sale of assets, your information may
            be transferred as part of that transaction. We will provide notice
            on this site of any change in ownership or material change to the
            uses of your information.
          </p>

          <h3>7.5 What we don&rsquo;t do</h3>
          <p>
            We do not sell personal information for monetary consideration. We
            do not share personal information for cross-context behavioral
            advertising. We do not engage in &ldquo;sale&rdquo; or
            &ldquo;sharing&rdquo; of personal information as those terms are
            defined under the California Consumer Privacy Act of 2018, as
            amended by the California Privacy Rights Act (collectively,
            &ldquo;CCPA&rdquo;). We do not process Sensitive Personal
            Information (as defined under the CCPA) for the purpose of
            inferring characteristics about a consumer.
          </p>

          <h2>8. Cookies and similar technologies</h2>
          <p>We use the following categories of cookies:</p>
          <ul>
            <li>
              <strong>Strictly necessary</strong> &mdash; authentication and
              session cookies that keep you logged in. These cannot be
              disabled and the Service cannot function without them.
            </li>
            <li>
              <strong>Functional</strong> &mdash; remember your preferences
              such as theme, locale, and dashboard layout.
            </li>
            <li>
              <strong>Analytics</strong> &mdash; PostHog cookies, where used,
              record pseudonymous interaction events to help us improve the
              Service. Where required by law we ask for consent before
              setting these.
            </li>
          </ul>
          <p>
            <strong>Do Not Track and Global Privacy Control.</strong> Browsers
            and extensions may send a Global Privacy Control (GPC) signal or
            a Do Not Track (DNT) signal. We treat a recognized GPC signal as
            a valid request to opt out of any &ldquo;sale&rdquo; or
            &ldquo;sharing&rdquo; of personal information under the CCPA. We
            do not currently respond to DNT signals because there is no
            industry consensus on how to interpret them; we will revisit
            this if a standard emerges.
          </p>
          <p>
            You can clear cookies through your browser settings. Doing so will
            log you out and may reset preferences.
          </p>

          <h2>9. Multi-tenancy: controller vs. processor roles</h2>
          <p>
            When a Tenant uses SavSpot to take bookings from its Clients, two
            different relationships exist:
          </p>
          <ul>
            <li>
              <strong>SavSpot is the controller</strong> for personal
              information about Tenant administrators and team members (the
              users who sign in to SavSpot to run the business). This Privacy
              Policy governs that relationship.
            </li>
            <li>
              <strong>SavSpot is a processor</strong> for personal information
              about Clients that Tenants enter into the platform &mdash;
              including names, contact details, booking histories, and notes.
              The Tenant is the controller for that data, decides how it is
              used, and is responsible for its own privacy notices, lawful
              basis for processing, and responses to data-subject requests.
              Our Data Processing Addendum (available on request to{' '}
              <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>) governs
              that relationship.
            </li>
          </ul>
          <p>
            If you are a Client of a SavSpot Tenant and have questions about
            how the Tenant uses your data, contact the Tenant directly. SavSpot
            will forward verified requests to the relevant Tenant when we
            cannot act on them ourselves.
          </p>

          <h2>10. Data retention</h2>
          <p>
            We retain personal information for as long as needed to provide
            the Service and as required by law:
          </p>
          <ul>
            <li>
              <strong>Account data</strong> &mdash; for the life of your
              account plus 90 days after deletion to allow recovery.
            </li>
            <li>
              <strong>Booking and transaction records</strong> &mdash; for at
              least seven (7) years after the transaction to comply with
              standard accounting, tax, and chargeback-window requirements.
            </li>
            <li>
              <strong>Authentication logs</strong> &mdash; for at least 12
              months for security investigations.
            </li>
            <li>
              <strong>Marketing preferences and opt-outs</strong> &mdash; kept
              indefinitely to honor your choices, even after you delete your
              account.
            </li>
            <li>
              <strong>Backups</strong> &mdash; rolling 30-day backups; data
              that has been deleted from production will age out of backups
              within that window.
            </li>
          </ul>

          <h2>11. Your rights (general)</h2>
          <p>
            Depending on where you live, you may have the following rights
            under laws such as the GDPR, UK GDPR, and similar regimes:
          </p>
          <ul>
            <li>
              <strong>Access</strong> &mdash; receive a copy of the personal
              information we hold about you.
            </li>
            <li>
              <strong>Correction</strong> &mdash; correct inaccurate or
              incomplete information.
            </li>
            <li>
              <strong>Deletion</strong> &mdash; ask us to delete your account
              and personal information, subject to legal-retention exceptions.
            </li>
            <li>
              <strong>Portability</strong> &mdash; receive your data in a
              structured, machine-readable format.
            </li>
            <li>
              <strong>Restriction and objection</strong> &mdash; object to or
              restrict certain processing.
            </li>
            <li>
              <strong>Withdraw consent</strong> &mdash; withdraw any consent
              you have given without affecting the lawfulness of prior
              processing.
            </li>
            <li>
              <strong>Non-discrimination</strong> &mdash; we will not deny,
              charge for, or downgrade your Service for exercising these
              rights.
            </li>
            <li>
              <strong>Complaint</strong> &mdash; lodge a complaint with your
              local supervisory authority. EEA/UK users may contact their
              data-protection authority directly.
            </li>
          </ul>
          <p>
            To exercise these rights, email{' '}
            <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>. We may
            need to verify your identity. We will respond within the
            timeframes required by applicable law (typically 30&ndash;45
            days). We may refuse manifestly unfounded or excessive requests,
            as permitted by law.
          </p>

          <h2>12. Your California privacy rights (CCPA / CPRA)</h2>
          <p>
            If you are a California resident, you have the following rights
            in addition to those in Section 11. These rights apply to
            personal information we hold about you as a controller; for
            Client data Tenants enter into the Service, the Tenant is the
            controller and we will forward verified requests to them.
          </p>

          <h3>12.1 Categories of personal information collected</h3>
          <p>
            In the past 12 months we have collected the following CCPA
            categories of personal information (Cal. Civ. Code §1798.140):
          </p>
          <ul>
            <li>
              <strong>Identifiers</strong> &mdash; name, email, phone number,
              IP address, OAuth provider IDs, account identifiers.
            </li>
            <li>
              <strong>Customer records</strong> &mdash; business address,
              billing details (last 4 of card via Stripe).
            </li>
            <li>
              <strong>Commercial information</strong> &mdash; subscription
              tier, booking and transaction history.
            </li>
            <li>
              <strong>Internet or network activity</strong> &mdash; cookies,
              session logs, page-view events, device and browser metadata.
            </li>
            <li>
              <strong>Geolocation data</strong> &mdash; approximate location
              derived from IP address. We do not collect precise geolocation.
            </li>
            <li>
              <strong>Inferences</strong> &mdash; we do not generate
              inferences about consumers for profiling purposes.
            </li>
          </ul>
          <p>
            We do not collect or process Sensitive Personal Information under
            the CCPA other than account credentials (password hashes) used to
            authenticate you to the Service.
          </p>

          <h3>12.2 Sources and business purposes</h3>
          <p>
            Sources of collection are described in Section 4. We use these
            categories of personal information for the business purposes
            described in Section 5: providing the Service, billing,
            transactional communications, security, fraud prevention, legal
            compliance, and product improvement.
          </p>

          <h3>12.3 Your California rights</h3>
          <ul>
            <li>
              <strong>Right to know.</strong> Request the categories and
              specific pieces of personal information we have collected
              about you, the sources, the business purposes, and the
              categories of third parties with which we share it.
            </li>
            <li>
              <strong>Right to delete.</strong> Request deletion of personal
              information we have collected about you, subject to statutory
              exceptions (for example, transaction records we are required
              to retain for tax or anti-fraud purposes).
            </li>
            <li>
              <strong>Right to correct.</strong> Request correction of
              inaccurate personal information.
            </li>
            <li>
              <strong>Right to opt out of sale or sharing.</strong> We do not
              sell or share personal information as those terms are defined
              under the CCPA. A recognized Global Privacy Control (GPC)
              signal is treated as a valid opt-out request.
            </li>
            <li>
              <strong>Right to limit use of Sensitive Personal Information.</strong>{' '}
              We do not use Sensitive Personal Information for purposes that
              would require this option, but you may request that we limit
              such use if our practices change.
            </li>
            <li>
              <strong>Right to non-discrimination.</strong> We will not deny
              the Service, charge different prices, or provide a different
              level or quality of the Service because you exercised any
              CCPA right.
            </li>
            <li>
              <strong>Authorized agent.</strong> You may designate an
              authorized agent to submit requests on your behalf. We will
              require written proof of the agent&rsquo;s authority and
              verification of your identity.
            </li>
          </ul>

          <h3>12.4 How to submit a California request</h3>
          <p>
            Submit a request by emailing{' '}
            <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a> with the
            subject &ldquo;CCPA Request&rdquo; and the type of request. We
            verify requests by matching the request against information we
            already have on file about your account (typically the email
            address tied to the account, plus confirmation via that email).
            We will respond within 45 days; we may extend by an additional
            45 days for complex requests and will notify you of any
            extension.
          </p>

          <h3>12.5 California Shine the Light (Cal. Civ. Code §1798.83)</h3>
          <p>
            California residents may request, once per year and free of
            charge, information about the categories of personal information
            (if any) we have disclosed to third parties for their direct
            marketing purposes in the preceding calendar year. SavSpot does
            not disclose personal information to third parties for their
            own direct marketing.
          </p>

          <h3>12.6 California minors (Cal. Bus. &amp; Prof. Code §22581)</h3>
          <p>
            Registered users who are California residents under 18 may
            request removal of content or information they have posted on
            the Service by emailing{' '}
            <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>. Removal
            may not result in complete or comprehensive removal as
            described in Section 22581(c).
          </p>

          <h2>13. International data transfers</h2>
          <p>
            SavSpot infrastructure is primarily hosted in the United States.
            If you access the Service from outside the United States, your
            information will be transferred to, processed, and stored in the
            United States. Where required by law (for example, transfers out
            of the EEA or UK), we rely on the European Commission&rsquo;s
            Standard Contractual Clauses (SCCs) or equivalent transfer
            mechanisms with our sub-processors.
          </p>

          <h2>14. Children</h2>
          <p>
            The Service is not directed to children under 16, and we do not
            knowingly collect personal information from children under 16.
            Where required, Tenants serving minors are responsible for
            obtaining the verifiable consent required by COPPA, GDPR Article
            8, or other applicable law. If you believe a child has provided
            personal information to us without appropriate consent, contact{' '}
            <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a> and we
            will delete it.
          </p>

          <h2>15. Healthcare information (HIPAA exclusion)</h2>
          <p>
            The Service is not designed for the storage, transmission, or
            processing of Protected Health Information (&ldquo;PHI&rdquo;) or
            electronic Protected Health Information as defined under the
            Health Insurance Portability and Accountability Act of 1996
            and its implementing regulations (&ldquo;HIPAA&rdquo;). SJD
            Labs, LLC is not a HIPAA Business Associate, does not enter into
            Business Associate Agreements covering the Service, and does
            not represent that the Service is HIPAA-compliant.
          </p>
          <p>
            If you are a Covered Entity or Business Associate under HIPAA,
            you must not enter PHI into the Service. We may suspend or
            terminate accounts we reasonably believe are being used to
            store or transmit PHI in violation of our{' '}
            <Link href="/terms">Terms of Service</Link>.
          </p>

          <h2>16. Security</h2>
          <p>
            We implement technical and organizational measures designed to
            protect personal information, including: TLS in transit, AES-256
            at rest at the database layer, password hashing with bcrypt,
            row-level security for multi-tenant isolation, optional
            multi-factor authentication, role-based access controls within
            our team, audit logging of administrative actions, automated
            backups, and ongoing dependency scanning. No system is perfectly
            secure; we cannot guarantee absolute security.
          </p>

          <h2>17. Changes to this Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect
            changes in our practices or for other operational, legal, or
            regulatory reasons. When we do, we will update the &ldquo;Effective
            date&rdquo; at the top, and for material changes we will provide
            additional notice (such as an in-product banner or email).
            Continued use of the Service after the effective date of an
            updated policy constitutes acceptance of the changes.
          </p>

          <h2>18. Contact</h2>
          <p>
            Privacy questions or requests:{' '}
            <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>
            <br />
            General support:{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </p>
          <address className="not-italic">
            SJD Labs, LLC<br />
            4653 Carmel Mountain Rd, Ste 308 #AA229<br />
            San Diego, CA 92130<br />
            United States
          </address>
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
            href="/terms"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}

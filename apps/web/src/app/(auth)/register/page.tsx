import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/register-form';
import { MANAGED_HOSTING_CLOSED, SELF_HOST_GITHUB_URL } from '@/lib/managed-hosting';

export const metadata: Metadata = {
  title: MANAGED_HOSTING_CLOSED ? 'Self-host SavSpot' : 'Sign Up - SavSpot',
  description: MANAGED_HOSTING_CLOSED
    ? 'Managed hosting is currently closed. SavSpot is open-source — clone the repo to self-host.'
    : 'Create your SavSpot account',
};

export default function RegisterPage() {
  if (MANAGED_HOSTING_CLOSED) {
    return (
      <div className="space-y-6 text-center">
        <h2 className="text-xl font-semibold">Managed hosting is closed</h2>
        <p className="text-sm text-muted-foreground">
          SavSpot is open-source and the codebase is fully self-hostable.
          The hosted instance at <code>savspot.co</code> is not currently
          accepting new accounts.
        </p>
        <p className="text-sm text-muted-foreground">
          Want to run your own SavSpot? Clone the repository and follow
          the self-hosting guide.
        </p>
        <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center">
          <Link
            href={SELF_HOST_GITHUB_URL}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            View on GitHub
          </Link>
          <Link
            href="/docs/self-hosting"
            className="inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Self-hosting guide
          </Link>
        </div>
        <p className="pt-4 text-xs text-muted-foreground">
          Existing users can still{' '}
          <Link href="/login" className="underline hover:text-foreground">
            sign in
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold">Create an account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started with SavSpot
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}

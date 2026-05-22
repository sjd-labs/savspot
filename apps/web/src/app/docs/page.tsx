import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Server, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Documentation — SavSpot',
  description:
    'Guides for getting started with SavSpot, self-hosting your own instance, and integrating with the API.',
  openGraph: {
    title: 'Documentation — SavSpot',
    description:
      'Guides for getting started with SavSpot, self-hosting your own instance, and integrating with the API.',
    type: 'website',
    url: 'https://savspot.co/docs',
    siteName: 'SavSpot',
  },
};

interface DocCardProps {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function DocCard({ href, title, description, icon }: DocCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-lg border bg-card p-6 transition-colors hover:border-primary/50 hover:bg-accent/30"
    >
      <div className="text-primary">{icon}</div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="mt-auto flex items-center gap-1 text-sm font-medium text-primary">
        Read guide
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export default function DocsIndexPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Documentation
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Guides for getting the most out of SavSpot — whether you&apos;re
          running on our cloud or hosting it yourself.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <DocCard
          href="/docs/self-hosting"
          title="Self-Hosting Guide"
          description="Run your own SavSpot instance with Docker. Full source, no limits, no fees."
          icon={<Server className="h-8 w-8" />}
        />
        <DocCard
          href="https://github.com/sjd-labs/savspot"
          title="Source on GitHub"
          description="Browse the open-source codebase, file issues, or contribute back."
          icon={<BookOpen className="h-8 w-8" />}
        />
      </section>

      <footer className="mt-16 text-center text-sm text-muted-foreground">
        More guides coming soon. Need help in the meantime?{' '}
        <Link
          href="/contact"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Get in touch
        </Link>
        .
      </footer>
    </main>
  );
}

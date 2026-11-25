import Link from 'next/link';
import {
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  CardActions,
  CardBody,
  CardDescription,
  CardTitle,
  Checkbox,
  Field,
  Input,
  Toggle,
} from 'orbitui/react';
import { CopyCommand } from './copy-command';

const features = [
  {
    title: 'Works with any framework',
    text: 'Plain class names like btn and card work in React, Vue, Svelte, Astro, Blade or HTML.',
  },
  {
    title: 'Typed React components',
    text: 'Optional React layer with full TypeScript types, forwarded refs and zero dependencies.',
  },
  {
    title: 'Themes in one attribute',
    text: 'Light, dark and custom themes. Switch everything with data-theme on any element.',
  },
  {
    title: 'Accessible by default',
    text: 'Built on native dialog, input and button elements, so keyboard and screen reader support come free.',
  },
  {
    title: 'Only what you use',
    text: 'Classes are Tailwind utilities, generated on demand. Unused components add zero bytes.',
  },
  {
    title: 'Easy to customize',
    text: 'Every component reads CSS variables. Change one detail without overriding the whole thing.',
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden border-b border-fd-border">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(60%_0.2_268/0.18),transparent_60%)]" />
        <div className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-24 pb-20 text-center">
          <span className="mb-6 rounded-full border border-fd-border bg-fd-card px-3 py-1 text-xs text-fd-muted-foreground">
            Built for Tailwind CSS v4
          </span>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
            Beautiful components, without the class soup
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-fd-muted-foreground text-balance">
            Orbit UI adds semantic classes, themes and typed React components on top of Tailwind. Write{' '}
            <code className="rounded bg-fd-muted px-1.5 py-0.5 text-sm">btn btn-primary</code> instead of fifteen
            utilities.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/docs"
              className="rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
            >
              Get started
            </Link>
            <Link
              href="/docs/components/button"
              className="rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
            >
              Browse components
            </Link>
          </div>
          <CopyCommand command="npm i orbitui" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-20">
        <div className="grid gap-4 md:grid-cols-2">
          <ShowcaseSurface theme="light" />
          <ShowcaseSurface theme="dark" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-24">
        <h2 className="text-center text-3xl font-bold tracking-tight">Everything you need to ship</h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-fd-border bg-fd-card p-6">
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-fd-border py-8 text-center text-sm text-fd-muted-foreground">
        MIT licensed. Built by{' '}
        <a href="https://hammadriaz.dev" className="underline underline-offset-4">
          Hammad Ahmed Riaz
        </a>
        .
      </footer>
    </main>
  );
}

function ShowcaseSurface({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <div data-theme={theme} className="flex flex-col gap-4 rounded-2xl border border-base-300 bg-base-200 p-6 text-base-content">
      <div className="flex items-center justify-between">
        <AvatarGroup>
          <Avatar name="Hammad Riaz" size="sm" />
          <Avatar name="Sara Khan" size="sm" className="bg-primary text-primary-content" />
          <Avatar name="Lukas Bauer" size="sm" className="bg-accent text-accent-content" />
        </AvatarGroup>
        <Badge color="success" variant="soft">
          {theme}
        </Badge>
      </div>
      <Card>
        <CardBody>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Start your 14 day free trial. No card needed.</CardDescription>
          <div className="mt-2 flex flex-col gap-3">
            <Field label="Email">
              <Input type="email" placeholder="you@example.com" />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox defaultChecked /> Send me product updates
            </label>
          </div>
          <CardActions>
            <Button variant="ghost">Cancel</Button>
            <Button color="primary">Continue</Button>
          </CardActions>
        </CardBody>
      </Card>
      <Alert status="info" title="Heads up">
        Themes switch with a single attribute.
      </Alert>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" color="secondary">
          Secondary
        </Button>
        <Button size="sm" color="accent" variant="soft">
          Soft
        </Button>
        <Button size="sm" variant="outline">
          Outline
        </Button>
        <Toggle size="sm" color="primary" defaultChecked aria-label="Toggle" className="ml-auto" />
      </div>
    </div>
  );
}

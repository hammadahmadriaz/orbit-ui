'use client';

import * as React from 'react';
import {
  Badge,
  Card,
  CardBody,
  Progress,
  RadialProgress,
  Spinner,
  ToastProvider,
  Toggle,
  useToast,
  Button,
  Field,
  Input,
  Modal,
  ModalActions,
  ModalBody,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@orbitdesign/ui/react';

/* Demos that need state live here, since MDX content is server rendered. */

export function ModalDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button color="primary" onClick={() => setOpen(true)}>
        Open modal
      </Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalHeader>
          <ModalTitle>Delete project?</ModalTitle>
          <ModalDescription>This removes the project and all of its files.</ModalDescription>
        </ModalHeader>
        <ModalBody>You can restore it from the trash for 30 days.</ModalBody>
        <ModalActions>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button color="error" onClick={() => setOpen(false)}>
            Delete
          </Button>
        </ModalActions>
      </Modal>
    </>
  );
}

export function ModalFormDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Edit profile
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} size="sm">
        <ModalHeader>
          <ModalTitle>Edit profile</ModalTitle>
        </ModalHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setOpen(false);
          }}
        >
          <Field label="Name">
            <Input defaultValue="Hammad Riaz" />
          </Field>
          <Field label="Email">
            <Input type="email" defaultValue="hello@example.com" />
          </Field>
          <ModalActions className="mt-2">
            <Button type="submit" color="primary" block>
              Save changes
            </Button>
          </ModalActions>
        </form>
      </Modal>
    </>
  );
}

export function LoadingButtonDemo() {
  const [loading, setLoading] = React.useState(false);
  return (
    <Button
      color="primary"
      loading={loading}
      onClick={() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1500);
      }}
    >
      {loading ? 'Saving' : 'Click to save'}
    </Button>
  );
}


/* HUD theme showcase: a small control panel. */
export function HudShowcase() {
  const [power, setPower] = React.useState(76);
  React.useEffect(() => {
    const id = setInterval(() => setPower((p) => (p >= 96 ? 64 : p + 4)), 1400);
    return () => clearInterval(id);
  }, []);
  return (
    <div data-theme="hud" className="not-prose my-6 grid gap-4 rounded-box bg-base-200 p-5 text-base-content hud-grid sm:grid-cols-[auto_1fr]">
      <div className="card hud-frame hud-scan grid place-items-center p-6">
        <RadialProgress value={power} size="7.5rem" thickness="5px" className="text-glow">
          <span className="flex flex-col items-center leading-tight">
            <span className="text-2xl">{power}%</span>
            <span className="text-[9px] tracking-[0.25em] opacity-70">POWER</span>
          </span>
        </RadialProgress>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs tracking-[0.3em] text-primary text-glow">ORBIT // SYSTEMS</span>
          <Badge color="success" variant="soft" size="sm">ONLINE</Badge>
        </div>
        <div className="flex flex-col gap-2 text-xs">
          <label className="flex items-center justify-between gap-3">Shields <Progress value={88} size="sm" className="max-w-56" /></label>
          <label className="flex items-center justify-between gap-3">Thrusters <Progress value={54} size="sm" color="secondary" className="max-w-56" /></label>
          <label className="flex items-center justify-between gap-3">Scanner <Progress size="sm" color="accent" className="max-w-56" /></label>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Button color="primary" size="sm">Engage</Button>
          <Button color="secondary" variant="outline" size="sm" className="clip-corner">Override</Button>
          <Spinner variant="orbit" className="text-primary" />
          <label className="ml-auto flex items-center gap-2 text-xs">Autopilot <Toggle size="sm" defaultChecked /></label>
        </div>
      </div>
    </div>
  );
}

const playgroundAnimations = [
  'animate-fade-in',
  'animate-fade-up',
  'animate-fade-down',
  'animate-slide-in-left',
  'animate-slide-in-right',
  'animate-zoom-in',
  'animate-blur-in',
  'animate-flip-in',
  'animate-pop',
];

/* Click an animation name to replay it. */
export function AnimationPlayground() {
  const [anim, setAnim] = React.useState('animate-fade-up');
  const [key, setKey] = React.useState(0);
  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border border-fd-border">
      <div className="flex flex-wrap gap-1.5 border-b border-fd-border bg-fd-muted/40 p-2">
        {playgroundAnimations.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => {
              setAnim(a);
              setKey((k) => k + 1);
            }}
            className={
              'rounded-md px-2 py-1 font-mono text-xs transition-colors ' +
              (anim === a ? 'bg-fd-primary text-fd-primary-foreground' : 'text-fd-muted-foreground hover:text-fd-foreground')
            }
          >
            {a.replace('animate-', '')}
          </button>
        ))}
      </div>
      <div data-theme="hud" className="grid min-h-56 place-items-center bg-base-100 p-8 hud-grid">
        <div key={key} className="stagger flex gap-3">
          {['O', 'R', 'B', 'I', 'T'].map((l) => (
            <div key={l} className={`card hud-frame grid size-14 place-items-center text-xl font-bold text-primary text-glow ${anim}`}>
              {l}
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-fd-border px-3 py-2 font-mono text-xs text-fd-muted-foreground">
        {`<div class="stagger">  <div class="${anim}">...</div>  </div>`}
      </div>
    </div>
  );
}

export function ScrollRevealDemo() {
  return (
    <div className="not-prose my-6 h-80 overflow-y-auto rounded-xl border border-fd-border">
      <div className="flex h-40 items-center justify-center text-sm text-fd-muted-foreground">Scroll down inside this box</div>
      <div className="flex flex-col gap-4 p-6">
        {['Design', 'Build', 'Test', 'Ship', 'Repeat'].map((t, i) => (
          <Card key={t} className={`reveal ${i % 2 ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}>
            <CardBody>
              <strong>{t}</strong>
              <span className="text-sm opacity-70">This card animates as it scrolls into view.</span>
            </CardBody>
          </Card>
        ))}
      </div>
      <div className="h-24" />
    </div>
  );
}

export function RadialProgressDemo() {
  const [v, setV] = React.useState(72);
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-wrap items-center justify-center gap-6">
        <RadialProgress value={v} />
        <RadialProgress value={v * 0.6} color="secondary" size="6rem" thickness="6px" />
        <RadialProgress value={Math.min(100, v + 20)} color="success" size="5rem">
          {v + 20 >= 100 ? 'OK' : `${Math.min(100, v + 20)}%`}
        </RadialProgress>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={v}
        onChange={(e) => setV(Number(e.target.value))}
        aria-label="Value"
        className="w-56 accent-[var(--color-primary)]"
      />
    </div>
  );
}

function ToastButtons() {
  const { toast } = useToast();
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button
        color="success"
        onClick={() => toast({ status: 'success', title: 'Changes saved', description: 'Your profile has been updated.' })}
      >
        Success
      </Button>
      <Button
        color="error"
        variant="outline"
        onClick={() => toast({ status: 'error', title: 'Upload failed', description: 'The file is larger than 10 MB.' })}
      >
        Error
      </Button>
      <Button
        variant="soft"
        onClick={() =>
          toast({
            status: 'info',
            title: 'File moved to trash',
            duration: 8000,
            action: (
              <Button size="xs" variant="outline">
                Undo
              </Button>
            ),
          })
        }
      >
        With action
      </Button>
    </div>
  );
}

export function ToastDemo() {
  return (
    <ToastProvider position="bottom-end">
      <ToastButtons />
    </ToastProvider>
  );
}

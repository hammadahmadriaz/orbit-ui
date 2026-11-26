import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  Checkbox,
  Field,
  Input,
  OrbitProvider,
  Progress,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Toggle,
  Tooltip,
  orbitVars,
} from "../src/react";

function mockReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes("reduce"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  mockReducedMotion(false);
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    cb(0);
    return 1;
  });
});
afterEach(() => vi.restoreAllMocks());

describe("orbitVars", () => {
  it("maps effects, glow shortcut and motion to CSS variables", () => {
    expect(
      orbitVars({ glow: 0.8, effects: { scan: true, energy: false, depth: true }, motion: { duration: 240, easing: "linear", press: 1 } }),
    ).toEqual({
      "--orbit-glow": 0.8,
      "--orbit-scan": 1,
      "--orbit-energy": 0,
      "--orbit-depth": 0.8,
      "--orbit-duration": "240ms",
      "--orbit-ease": "linear",
      "--orbit-press": 1,
    });
  });

  it("clamps levels and treats true glow as 0.6", () => {
    expect(orbitVars({ glow: 3 })).toEqual({ "--orbit-glow": 1 });
    expect(orbitVars({ glow: true })).toEqual({ "--orbit-glow": 0.6 });
  });

  it("returns nothing when nothing is set", () => {
    expect(orbitVars({})).toEqual({});
  });
});

describe("OrbitProvider", () => {
  it("renders a layout neutral wrapper with mode, theme and variables", () => {
    const { container } = render(
      <OrbitProvider mode="holo" theme="hud" effects={{ glow: 0.4 }} motion={{ duration: 300 }}>
        <span>child</span>
      </OrbitProvider>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveAttribute("data-orbit-mode", "holo");
    expect(wrapper).toHaveAttribute("data-theme", "hud");
    expect(wrapper.style.display).toBe("contents");
    expect(wrapper.style.getPropertyValue("--orbit-glow")).toBe("0.4");
    expect(wrapper.style.getPropertyValue("--orbit-duration")).toBe("300ms");
  });
});

describe("Override precedence", () => {
  it("component defaults from the provider apply to every instance", () => {
    render(
      <OrbitProvider components={{ Button: { mode: "enhanced", glow: 0.3 } }}>
        <Button>One</Button>
      </OrbitProvider>,
    );
    const btn = screen.getByRole("button", { name: "One" });
    expect(btn).toHaveAttribute("data-orbit-mode", "enhanced");
    expect(btn.style.getPropertyValue("--orbit-glow")).toBe("0.3");
  });

  it("instance props win over component defaults, and style wins over props", () => {
    render(
      <OrbitProvider components={{ Button: { mode: "enhanced", glow: 0.3, motion: { duration: 100 } } }}>
        <Button mode="holo" glow={0.9} style={{ ["--orbit-glow" as string]: 0.1 }}>
          Two
        </Button>
      </OrbitProvider>,
    );
    const btn = screen.getByRole("button", { name: "Two" });
    expect(btn).toHaveAttribute("data-orbit-mode", "holo");
    expect(btn.style.getPropertyValue("--orbit-glow")).toBe("0.1");
    // Not overridden by the instance, so the component default stays.
    expect(btn.style.getPropertyValue("--orbit-duration")).toBe("100ms");
  });

  it("does not leak engine props to the DOM", () => {
    render(<Button mode="holo" effects={{ scan: true }} glow motion={{ duration: 1 }}>Clean</Button>);
    const btn = screen.getByRole("button");
    for (const attr of ["mode", "effects", "glow", "motion"]) expect(btn).not.toHaveAttribute(attr);
  });
});

describe("Backward compatibility with 0.2", () => {
  it("renders the same markup when no engine props are used", () => {
    render(
      <>
        <Button color="primary">A</Button>
        <Badge color="success">B</Badge>
        <Card data-testid="card">C</Card>
        <Input aria-label="D" />
      </>,
    );
    const btn = screen.getByRole("button");
    expect(btn.className).toBe("btn btn-primary");
    expect(btn).not.toHaveAttribute("style");
    expect(btn).not.toHaveAttribute("data-orbit-mode");
    expect(screen.getByText("B").className).toBe("badge badge-success");
    expect(screen.getByTestId("card").className).toBe("card");
    expect(screen.getByLabelText("D").className).toBe("input");
    expect(screen.getByLabelText("D")).not.toHaveAttribute("aria-invalid");
  });

  it("flat still removes the shadow", () => {
    render(<Card flat data-testid="card" />);
    expect(screen.getByTestId("card")).toHaveClass("card-flat");
  });
});

describe("Button engine behaviour", () => {
  it("sets radius and the loading state class", () => {
    render(
      <Button radius={20} loading>
        Save
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn.style.getPropertyValue("--btn-radius")).toBe("20px");
    expect(btn).toHaveClass("btn-loading");
    expect(btn).toBeDisabled();
  });

  it("stores the press point for the press wave without re-rendering", () => {
    const onPointerDown = vi.fn();
    render(<Button onPointerDown={onPointerDown}>Press</Button>);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { clientX: 12, clientY: 7 });
    expect(onPointerDown).toHaveBeenCalledOnce();
    expect(btn.style.getPropertyValue("--orbit-px")).toBe("12px");
    expect(btn.style.getPropertyValue("--orbit-py")).toBe("7px");
  });
});

describe("Input engine behaviour", () => {
  it("status error sets aria-invalid and the error class", () => {
    render(<Input aria-label="Email" status="error" color="primary" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveClass("input", "input-error");
    expect(input).not.toHaveClass("input-primary");
  });

  it("status success uses the success class and stays valid", () => {
    render(<Input aria-label="Email" status="success" />);
    expect(screen.getByLabelText("Email")).toHaveClass("input-success");
    expect(screen.getByLabelText("Email")).not.toHaveAttribute("aria-invalid");
  });

  it("prefix and suffix wrap the input and keep label, ref and field wiring", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(
      <Field label="Website" hint="Your homepage">
        <Input ref={ref} prefix="https://" suffix=".com" mode="holo" />
      </Field>,
    );
    const input = screen.getByLabelText("Website");
    expect(input).toHaveClass("input-bare");
    expect(ref.current).toBe(input);
    expect(input).toHaveAccessibleDescription("Your homepage");
    const box = input.parentElement!;
    expect(box).toHaveClass("input");
    expect(box).toHaveAttribute("data-orbit-mode", "holo");
    expect(box).toHaveTextContent("https://");
    fireEvent.pointerDown(box);
    expect(input).toHaveFocus();
  });
});

describe("Card engine behaviour", () => {
  it("maps elevation, framed and interactive to classes", () => {
    render(<Card data-testid="c" elevation={3} framed interactive radius="1.5rem" />);
    const card = screen.getByTestId("c");
    expect(card).toHaveClass("card", "card-floating", "card-framed", "card-interactive");
    expect(card.style.getPropertyValue("--card-radius")).toBe("1.5rem");
  });

  it("follows the pointer when ambient is on", () => {
    render(
      <Card data-testid="c" interactive effects={{ ambient: true }}>
        <CardBody>x</CardBody>
      </Card>,
    );
    const card = screen.getByTestId("c");
    vi.spyOn(card, "getBoundingClientRect").mockReturnValue({ left: 0, top: 0, width: 200, height: 100 } as DOMRect);
    fireEvent.pointerEnter(card, { pointerType: "mouse" });
    fireEvent.pointerMove(card, { clientX: 150, clientY: 25 });
    expect(card.style.getPropertyValue("--orbit-mx")).toBe("75.0%");
    expect(card.style.getPropertyValue("--orbit-my")).toBe("25.0%");
    expect(card.style.getPropertyValue("--orbit-tx")).toBe("1.50deg");
    fireEvent.pointerLeave(card);
    expect(card.style.getPropertyValue("--orbit-tx")).toBe("");
  });

  it("does nothing for users who prefer reduced motion", () => {
    mockReducedMotion(true);
    render(<Card data-testid="c" interactive effects={{ ambient: true }} />);
    const card = screen.getByTestId("c");
    fireEvent.pointerEnter(card, { pointerType: "mouse" });
    fireEvent.pointerMove(card, { clientX: 150, clientY: 25 });
    expect(card.style.getPropertyValue("--orbit-mx")).toBe("");
  });

  it("does nothing when ambient is off", () => {
    render(<Card data-testid="c" interactive effects={{ ambient: false }} />);
    const card = screen.getByTestId("c");
    fireEvent.pointerEnter(card, { pointerType: "mouse" });
    fireEvent.pointerMove(card, { clientX: 150, clientY: 25 });
    expect(card.style.getPropertyValue("--orbit-mx")).toBe("");
  });
});

describe("Badge engine behaviour", () => {
  it("adds pulse and dot classes and engine attributes", () => {
    render(
      <Badge pulse dot color="success" mode="holo">
        Live
      </Badge>,
    );
    const badge = screen.getByText("Live");
    expect(badge).toHaveClass("badge", "badge-success", "badge-pulse", "badge-dot");
    expect(badge).toHaveAttribute("data-orbit-mode", "holo");
  });
});

describe("Server rendering", () => {
  const App = () => (
    <OrbitProvider mode="holo" theme="hud" components={{ Card: { effects: { holo: true } } }}>
      <Button color="primary" glow={0.5}>
        Engage
      </Button>
      <Card interactive framed>
        <CardBody>Panel</CardBody>
      </Card>
      <Field label="Name" hint="Hint">
        <Input prefix="@" status="success" />
      </Field>
      <Badge pulse dot>
        Live
      </Badge>
      <Alert status="info" title="Note" />
      <Avatar name="Hammad Riaz" />
      <Checkbox aria-label="c" defaultChecked />
      <Toggle aria-label="t" />
      <Progress value={40} aria-label="p" />
      <Spinner variant="orbit" />
      <Tooltip content="Tip">
        <button>T</button>
      </Tooltip>
      <Tabs defaultValue="a">
        <TabList aria-label="tabs">
          <Tab value="a">A</Tab>
        </TabList>
        <TabPanel value="a">Panel A</TabPanel>
      </Tabs>
    </OrbitProvider>
  );

  it("renders to a string without touching browser APIs", () => {
    const html = renderToString(<App />);
    expect(html).toContain('data-orbit-mode="holo"');
    expect(html).toContain("--orbit-glow:0.5");
  });

  it("hydrates without mismatches", async () => {
    const html = renderToString(<App />);
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);
    const onRecoverableError = vi.fn();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    await act(async () => {
      hydrateRoot(container, <App />, { onRecoverableError });
    });
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    container.remove();
  });
});

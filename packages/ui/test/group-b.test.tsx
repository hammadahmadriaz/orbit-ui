import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalTitle,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Tooltip,
} from "../src/react";

/** Pretend an element has a CSS animation of `ms` (jsdom has no CSS engine). */
function mockAnimation(match: (el: Element) => boolean, ms: number) {
  const real = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation((el: Element, pseudo?: string | null) => {
    const style = real(el, pseudo);
    if (!match(el)) return style;
    return new Proxy(style, {
      get(target, prop) {
        if (prop === "animationDuration") return `${ms}ms`;
        if (prop === "animationDelay") return "0s";
        if (prop === "animationName") return "orbit-test";
        const v = Reflect.get(target, prop);
        return typeof v === "function" ? v.bind(target) : v;
      },
    });
  });
}

beforeEach(() => {
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    cb(0);
    return 1;
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  document.documentElement.style.overflow = "";
});

describe("Modal", () => {
  function Example({ open, onClose = () => {}, lock }: { open: boolean; onClose?: () => void; lock?: boolean }) {
    return (
      <Modal open={open} onClose={onClose} lockScroll={lock} mode="holo">
        <ModalTitle>System</ModalTitle>
      </Modal>
    );
  }

  it("locks page scroll while open and restores it after", () => {
    const { rerender } = render(<Example open />);
    expect(document.documentElement.style.overflow).toBe("hidden");
    rerender(<Example open={false} />);
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("keeps the lock until the last of two modals closes", () => {
    const { rerender } = render(
      <>
        <Example open />
        <Example open />
      </>,
    );
    rerender(
      <>
        <Example open />
        <Example open={false} />
      </>,
    );
    expect(document.documentElement.style.overflow).toBe("hidden");
    rerender(
      <>
        <Example open={false} />
        <Example open={false} />
      </>,
    );
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("can opt out of scroll lock", () => {
    render(<Example open lock={false} />);
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("plays the exit animation before closing", () => {
    vi.useFakeTimers();
    const { container, rerender } = render(<Example open />);
    const dialog = container.querySelector("dialog")!;
    expect(dialog).toHaveAttribute("data-orbit-mode", "holo");
    mockAnimation((el) => el === dialog, 300);
    rerender(<Example open={false} />);
    expect(dialog).toHaveAttribute("data-state", "closed");
    expect(dialog).toHaveAttribute("open");
    act(() => vi.advanceTimersByTime(310));
    expect(dialog).not.toHaveAttribute("open");
    expect(dialog).not.toHaveAttribute("data-state");
  });

  it("closes instantly when there is no animation (standard mode, reduced motion)", () => {
    const { container, rerender } = render(<Example open />);
    rerender(<Example open={false} />);
    expect(container.querySelector("dialog")).not.toHaveAttribute("open");
  });

  it("calls onClose on Escape (cancel event)", () => {
    const onClose = vi.fn();
    const { container } = render(<Example open onClose={onClose} />);
    fireEvent(container.querySelector("dialog")!, new Event("cancel", { cancelable: true }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe("Dropdown", () => {
  function Example() {
    return (
      <Dropdown mode="holo">
        <DropdownTrigger>Actions</DropdownTrigger>
        <DropdownMenu>
          <DropdownItem shortcut="Ctrl+E">Edit</DropdownItem>
          <DropdownItem>Duplicate</DropdownItem>
          <DropdownItem>Delete</DropdownItem>
          <DropdownItem>Download</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  }

  it("passes the mode to the root and shows shortcuts to sighted users only", () => {
    render(<Example />);
    fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    expect(screen.getByRole("button", { name: "Actions" }).parentElement).toHaveAttribute("data-orbit-mode", "holo");
    const edit = screen.getByRole("menuitem", { name: "Edit" });
    expect(edit.querySelector(".menu-shortcut")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("menu")).toHaveAttribute("data-state", "open");
  });

  it("jumps to items by typing their first letters", () => {
    render(<Example />);
    fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    const menu = screen.getByRole("menu");
    fireEvent.keyDown(menu, { key: "d" });
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    fireEvent.keyDown(menu, { key: "d" });
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    fireEvent.keyDown(menu, { key: "d" });
    expect(screen.getByRole("menuitem", { name: "Download" })).toHaveFocus();
  });

  it("keeps the menu mounted while its exit animation runs", () => {
    vi.useFakeTimers();
    render(<Example />);
    fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    mockAnimation((el) => el.getAttribute("role") === "menu", 200);
    fireEvent.keyDown(document, { key: "Escape" });
    const menu = screen.getByRole("menu");
    expect(menu).toHaveAttribute("data-state", "closed");
    act(() => vi.advanceTimersByTime(210));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});

describe("Tabs sliding indicator", () => {
  function Example() {
    return (
      <Tabs defaultValue="a" mode="holo">
        <TabList aria-label="Sections">
          <Tab value="a">Alpha</Tab>
          <Tab value="b">Beta</Tab>
        </TabList>
        <TabPanel value="a">A</TabPanel>
        <TabPanel value="b">B</TabPanel>
      </Tabs>
    );
  }

  it("renders a hidden indicator and moves it to the active tab", () => {
    const left = vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(function (this: HTMLElement) {
      return this.textContent === "Beta" ? 80 : 0;
    });
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
      return this.textContent === "Beta" ? 60 : 70;
    });
    render(<Example />);
    const list = screen.getByRole("tablist");
    expect(list).toHaveClass("tabs-animated");
    expect(list.querySelector(".tabs-indicator")).toHaveAttribute("aria-hidden", "true");
    expect(list).toHaveAttribute("data-indicator");
    expect(list.style.getPropertyValue("--tab-w")).toBe("70px");
    fireEvent.click(screen.getByRole("tab", { name: "Beta" }));
    expect(list.style.getPropertyValue("--tab-x")).toBe("80px");
    expect(list.style.getPropertyValue("--tab-w")).toBe("60px");
    expect(list.style.getPropertyValue("--tab-ready")).toBe("1");
    expect(list.parentElement).toHaveAttribute("data-orbit-mode", "holo");
    left.mockRestore();
  });
});

describe("Tooltip", () => {
  it("sets the show delay", () => {
    render(
      <Tooltip content="Hint" delay={500}>
        <Button>Info</Button>
      </Tooltip>,
    );
    const wrapper = screen.getByRole("button").parentElement!;
    expect(wrapper.style.getPropertyValue("--tt-delay")).toBe("500ms");
  });

  it("Escape dismisses it without closing what is around it", () => {
    const outer = vi.fn();
    render(
      <div onKeyDown={outer}>
        <Tooltip content="Hint">
          <Button>Info</Button>
        </Tooltip>
      </div>,
    );
    const btn = screen.getByRole("button");
    btn.focus();
    fireEvent.keyDown(btn, { key: "Escape" });
    expect(btn.parentElement).toHaveClass("tooltip-dismissed");
    expect(outer).not.toHaveBeenCalled();
    // A second Escape goes through to the page again.
    fireEvent.keyDown(btn, { key: "Escape" });
    expect(outer).toHaveBeenCalledOnce();
  });

  it("listens on the document only while hovered, and resets on leave", () => {
    const add = vi.spyOn(document, "addEventListener");
    const remove = vi.spyOn(document, "removeEventListener");
    render(
      <Tooltip content="Hint">
        <Button>Info</Button>
      </Tooltip>,
    );
    expect(add.mock.calls.filter(([t]) => t === "keydown")).toHaveLength(0);
    const wrapper = screen.getByRole("button").parentElement!;
    fireEvent.pointerEnter(wrapper);
    expect(add.mock.calls.filter(([t]) => t === "keydown")).toHaveLength(1);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(wrapper).toHaveClass("tooltip-dismissed");
    fireEvent.pointerLeave(wrapper);
    expect(remove.mock.calls.filter(([t]) => t === "keydown").length).toBeGreaterThan(0);
    expect(wrapper).not.toHaveClass("tooltip-dismissed");
  });
});

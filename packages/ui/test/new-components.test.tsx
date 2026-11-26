import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Progress,
  RadialProgress,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  ToastProvider,
  Tooltip,
  useToast,
} from "../src/react";

function TabsExample(props: { onValueChange?: (v: string) => void }) {
  return (
    <Tabs defaultValue="one" variant="pill" color="primary" onValueChange={props.onValueChange}>
      <TabList aria-label="Example">
        <Tab value="one">One</Tab>
        <Tab value="two">Two</Tab>
        <Tab value="three" disabled>
          Three
        </Tab>
      </TabList>
      <TabPanel value="one">Panel one</TabPanel>
      <TabPanel value="two">Panel two</TabPanel>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("renders variant classes and ARIA wiring", () => {
    render(<TabsExample />);
    expect(screen.getByRole("tablist")).toHaveClass("tabs", "tabs-pill", "tabs-primary");
    const one = screen.getByRole("tab", { name: "One" });
    expect(one).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel one");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", one.id);
  });

  it("switches on click and calls onValueChange", () => {
    const onChange = vi.fn();
    render(<TabsExample onValueChange={onChange} />);
    fireEvent.click(screen.getByRole("tab", { name: "Two" }));
    expect(onChange).toHaveBeenCalledWith("two");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel two");
  });

  it("moves with arrow keys and skips disabled tabs", () => {
    render(<TabsExample />);
    const one = screen.getByRole("tab", { name: "One" });
    one.focus();
    fireEvent.keyDown(one, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Two" })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(one).toHaveFocus();
  });
});

describe("Tooltip", () => {
  it("connects the trigger to the tooltip text", () => {
    render(
      <Tooltip content="Copy link" side="bottom" color="primary">
        <Button>Copy</Button>
      </Tooltip>,
    );
    const btn = screen.getByRole("button", { name: "Copy" });
    expect(btn).toHaveAccessibleDescription("Copy link");
    expect(screen.getByRole("tooltip", { hidden: true }).parentElement).toHaveClass(
      "tooltip",
      "tooltip-bottom",
      "tooltip-primary",
    );
  });
});

describe("Progress", () => {
  it("is indeterminate without a value", () => {
    const { container } = render(<Progress aria-label="Loading" />);
    expect(container.querySelector("progress")).not.toHaveAttribute("value");
  });

  it("renders value, color and stripes", () => {
    render(<Progress aria-label="Upload" value={40} color="success" striped />);
    const bar = screen.getByLabelText("Upload");
    expect(bar).toHaveAttribute("value", "40");
    expect(bar).toHaveClass("progress", "progress-success", "progress-striped");
  });

  it("radial clamps the value and shows a percentage", () => {
    render(<RadialProgress value={140} />);
    const gauge = screen.getByRole("progressbar");
    expect(gauge).toHaveAttribute("aria-valuenow", "100");
    expect(gauge).toHaveTextContent("100%");
  });
});

describe("Dropdown", () => {
  function Example({ onSelect }: { onSelect: () => void }) {
    return (
      <Dropdown align="end">
        <DropdownTrigger>Options</DropdownTrigger>
        <DropdownMenu>
          <DropdownItem onSelect={onSelect}>Edit</DropdownItem>
          <DropdownItem danger>Delete</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  }

  it("opens, focuses the first item and closes after selecting", () => {
    const onSelect = vi.fn();
    render(<Example onSelect={onSelect} />);
    const trigger = screen.getByRole("button", { name: "Options" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus();
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes on Escape and arrow keys move focus", () => {
    render(<Example onSelect={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Options" }));
    fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveClass("menu-item-danger");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});

describe("Toast", () => {
  function Trigger() {
    const { toast } = useToast();
    return <button onClick={() => toast({ title: "Saved", description: "All good", status: "success" })}>Save</button>;
  }

  it("shows a toast and removes it after the duration", () => {
    vi.useFakeTimers();
    render(
      <ToastProvider duration={1000} position="top-center">
        <Trigger />
      </ToastProvider>,
    );
    expect(screen.getByRole("region", { name: "Notifications" })).toHaveClass("toast", "toast-top-center");
    fireEvent.click(screen.getByText("Save"));
    expect(screen.getByText("Saved")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1300));
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("closes with the close button", () => {
    vi.useFakeTimers();
    render(
      <ToastProvider duration={Infinity}>
        <Trigger />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText("Save"));
    fireEvent.click(screen.getByLabelText("Close notification"));
    act(() => vi.advanceTimersByTime(300));
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});

describe("Spinner orbit", () => {
  it("adds the orbit class", () => {
    render(<Spinner variant="orbit" />);
    expect(screen.getByRole("status")).toHaveClass("spinner", "spinner-orbit");
  });
});

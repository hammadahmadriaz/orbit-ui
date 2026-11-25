import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
  Modal,
  ModalTitle,
  Toggle,
} from "../src/react";

describe("Button", () => {
  it("combines color, variant and size classes", () => {
    render(<Button color="primary" variant="outline" size="lg">Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveClass("btn", "btn-primary", "btn-outline", "btn-lg");
  });

  it("defaults to type=button", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("disables itself while loading", () => {
    render(<Button loading>Save</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });

  it("renders its child with asChild", () => {
    render(
      <Button asChild color="primary">
        <a href="/docs">Docs</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveClass("btn", "btn-primary");
    expect(link).toHaveAttribute("href", "/docs");
  });

  it("merges custom className", () => {
    render(<Button className="mt-4">X</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn", "mt-4");
  });
});

describe("Badge", () => {
  it("renders soft variant", () => {
    render(<Badge color="success" variant="soft">New</Badge>);
    expect(screen.getByText("New")).toHaveClass("badge", "badge-success", "badge-soft");
  });
});

describe("Card", () => {
  it("renders compact card", () => {
    render(<Card compact data-testid="c"><CardBody>Hi</CardBody></Card>);
    expect(screen.getByTestId("c")).toHaveClass("card", "card-compact");
    expect(screen.getByText("Hi")).toHaveClass("card-body");
  });
});

describe("Field + Input", () => {
  it("connects label, hint and error", () => {
    const { rerender } = render(
      <Field label="Email" hint="We never share it">
        <Input type="email" />
      </Field>,
    );
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAccessibleDescription("We never share it");

    rerender(
      <Field label="Email" error="Invalid email">
        <Input type="email" />
      </Field>,
    );
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription("Invalid email");
  });
});

describe("Alert", () => {
  it("uses role=alert for errors and shows title", () => {
    render(<Alert status="error" title="Failed">Try again</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("alert", "alert-error");
    expect(alert).toHaveTextContent("Failed");
  });
});

describe("Avatar", () => {
  it("falls back to initials", () => {
    render(<Avatar name="Hammad Riaz" />);
    expect(screen.getByRole("img", { name: "Hammad Riaz" })).toHaveTextContent("HR");
  });
});

describe("Checkbox and Toggle", () => {
  it("sets indeterminate", () => {
    render(<Checkbox aria-label="all" indeterminate />);
    expect((screen.getByLabelText("all") as HTMLInputElement).indeterminate).toBe(true);
  });
  it("toggle has switch role", () => {
    render(<Toggle aria-label="wifi" color="success" />);
    expect(screen.getByRole("switch")).toHaveClass("toggle", "toggle-success");
  });
});

describe("Modal", () => {
  it("opens and calls onClose from the close button", () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal open onClose={onClose}>
        <ModalTitle>Delete file?</ModalTitle>
      </Modal>,
    );
    expect(container.querySelector("dialog")).toHaveAttribute("open");
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

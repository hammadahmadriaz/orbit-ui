import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import axe from "axe-core";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardTitle,
  Checkbox,
  Field,
  Input,
  OrbitProvider,
  Progress,
  RadialProgress,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Toggle,
  Tooltip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalHeader,
  ModalTitle,
  type OrbitMode,
} from "../src/react";

const modes: OrbitMode[] = ["standard", "enhanced", "holo"];

function Showcase({ mode }: { mode: OrbitMode }) {
  return (
    <OrbitProvider mode={mode}>
      <main>
        <h1>Showcase</h1>
        <Button color="primary">Save</Button>
        <Button loading>Saving</Button>
        <Badge pulse dot color="success">Online</Badge>
        <Card interactive framed>
          <CardBody>
            <CardTitle as="h2">Card</CardTitle>
          </CardBody>
        </Card>
        <Field label="Email" hint="Work email">
          <Input type="email" prefix="@" />
        </Field>
        <Field label="Name" error="Required">
          <Input />
        </Field>
        <Input aria-label="Status" status="success" />
        <Alert status="warning" title="Careful">Check this</Alert>
        <Avatar name="Hammad Riaz" />
        <label>
          <Checkbox /> Remember
        </label>
        <label>
          <Toggle /> Wifi
        </label>
        <Progress value={30} aria-label="Upload" />
        <RadialProgress value={70} aria-label="Power" />
        <Spinner variant="orbit" />
        <Tooltip content="Copy link">
          <Button>Copy</Button>
        </Tooltip>
        <Tabs defaultValue="a">
          <TabList aria-label="Sections">
            <Tab value="a">A</Tab>
            <Tab value="b">B</Tab>
          </TabList>
          <TabPanel value="a">Panel A</TabPanel>
        </Tabs>
        <Dropdown defaultOpen>
          <DropdownTrigger>Options</DropdownTrigger>
          <DropdownMenu>
            <DropdownItem shortcut="Ctrl+E">Edit</DropdownItem>
            <DropdownItem danger>Delete</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Modal open onClose={() => {}} lockScroll={false}>
          <ModalHeader>
            <ModalTitle>Window</ModalTitle>
          </ModalHeader>
          <ModalBody>Content</ModalBody>
        </Modal>
      </main>
    </OrbitProvider>
  );
}

describe("Accessibility (axe)", () => {
  for (const mode of modes) {
    it(`has no violations in ${mode} mode`, async () => {
      const { container } = render(<Showcase mode={mode} />);
      const result = await axe.run(container, {
        // jsdom cannot compute colors or layout; contrast is checked in the browser.
        rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
      });
      const summary = result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
      expect(summary).toEqual([]);
    });
  }
});

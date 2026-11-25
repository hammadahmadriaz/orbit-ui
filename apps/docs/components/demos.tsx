'use client';

import * as React from 'react';
import {
  Button,
  Field,
  Input,
  Modal,
  ModalActions,
  ModalBody,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@orbitui/ui/react';

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

# Security Policy

## Supported versions

Only the latest minor release of `@orbitdesign/ui` receives security fixes.

| Version | Supported |
| --- | --- |
| 0.x (latest) | Yes |
| Older | No |

## Reporting a vulnerability

Please do **not** open a public issue for security problems.

Report it privately through GitHub: go to the **Security** tab of this repository and click **Report a vulnerability**. You can also email hammadahmadriaz@gmail.com with the subject "Orbit UI security".

Please include:

- what the problem is and where it is (file, component, version)
- steps to reproduce, or a small proof of concept
- the impact you expect

You will get a reply within 5 working days. Once a fix is ready, a new version is published and the issue is credited to you in the release notes, unless you prefer to stay anonymous.

## How releases are protected

- Every release is built and published by GitHub Actions, never from a personal machine.
- Packages are published with npm provenance, so anyone can verify which commit and workflow produced a version.
- The React package has zero runtime dependencies.
- Dependabot and CodeQL scan the repository on every change.

# Data Model: Chrome Extension Project Setup

This feature is a project scaffolding setup. There are no runtime data entities, persistence layers, or state machines. The "entities" are static configuration files and source entry points.

## Configuration Entities

### Manifest (manifest.json)

The Chrome extension descriptor. Copied from `static/manifest.json` to `dist/manifest.json` at build time.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| manifest_version | number (3) | Yes | Must be 3 for Manifest V3 |
| name | string | Yes | Extension display name ("Little Wing") |
| version | string | Yes | Semver-compatible version |
| description | string | Yes | Short description of the extension |
| action.default_popup | string | Yes | Path to popup HTML relative to dist |
| background.service_worker | string | Yes | Path to service worker JS relative to dist |

### Build Configuration (src/build.ts)

Programmatic Bun build configuration. Not a data entity but drives the build pipeline.

| Property | Value | Description |
|----------|-------|-------------|
| entrypoints | popup.ts, service-worker.ts | TypeScript entry points to bundle |
| outdir | ./dist | Output directory for bundled files |
| target | browser | Browser-compatible output |
| format | esm | ES module output |

## Relationships

```text
manifest.json
├── references → popup/popup.html (action.default_popup)
└── references → background/service-worker.js (background.service_worker)

popup.html
└── references → popup.js (script tag)
```

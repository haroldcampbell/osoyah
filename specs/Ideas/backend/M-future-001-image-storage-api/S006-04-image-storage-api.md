# S006-04-Image Storage API (Future)

Conform to `docs/principles.md`.

## Summary

Define the storage API needed to persist image attachments and return stable URLs for Markdown content.

## Goal

Move from mocked attachment URLs to real uploads with GUID v4 filenames and durable retrieval.

## Non-goals

-   Implementing the storage backend or authentication.
-   Replacing the Markdown renderer or attachment UI behavior.

## Definition of Done

-   [ ] Specify the upload endpoint path and contract (request/response) for image attachments.
-   [ ] Uploads accept raw files and respond with a public URL and stored filename.
-   [ ] Stored image filenames use GUID v4 values.
-   [ ] Define maximum file size (5MB) and supported types to match S006-02.
-   [ ] Define error responses for unsupported types, oversize files, and upload failures.
-   [ ] Document how the client should map returned URLs into Markdown image syntax.
-   [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

-   `npm run lint` passes.
-   `npm run test` passes.
-   `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)

-   This spec only documents the API and client integration expectations; no backend implementation is required.

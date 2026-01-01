# M-future-001-Image Storage API: Attachment Persistence

Conform to `docs/principles.md`.

## Summary

Define a future milestone for persisting image attachments and exposing stable URLs for Markdown content.

## Goal

Document the storage API contract needed to move from mocked attachment URLs to real uploads.

## Scope

In-scope:
-   Image upload API contract and client integration requirements.
-   Error handling for unsupported types, oversize files, and failures.

Out-of-scope:
-   Implementing the storage backend.
-   Auth, permissions, or multi-user access.
-   Non-image document storage.

## Specs

-   S006-04-Image Storage API (Future)

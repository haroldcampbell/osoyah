# M001: Configure core front-end environment

Conform to `principles.md`.

## Summary

Setup Angular environment and load core modules

## Goal

-   Ensure angular is installed and configured
-   Ensure material design is configured
-   Ensure that mock API structure is in place

## Scope

In-scope:
-   Angular workspace + dev tooling (ESLint/Prettier)
-   Angular Material setup and baseline theme
-   Mock API layer using `HttpClient` with `assets/data.json`
-   Data model interfaces for Board, List, Card
-   Sample data aligned to planned API responses

Out-of-scope:

-   Server configuration
-   App development
-   Security and Authorization

## Specs

-   S001-Angular workspace + tooling
-   S002-Material setup
-   S003-Mock API + models + sample data

## Notes

When applied, I should have:

-   a working front-end environment
-   an API service class that reads `assets/data.json` via `HttpClient`.
-   basic data model interfaces configured for Board, List, Card.

# Principles

## Architecture & System Design
- Design for clear ownership and boundaries; avoid leaky abstractions.
- Prefer simple, evolvable designs over over-engineering.
- Document tradeoffs and decisions when complexity is unavoidable.
- Favor explicit contracts between services and layers.

## Backend Engineering
- Prioritize correctness and reliability before optimization.
- Validate inputs at boundaries; fail fast with clear errors.
- Keep business logic isolated from transport and persistence.
- Make dependencies explicit and configuration consistent.

## Frontend & UX Engineering
- Design for clarity and speed of understanding.
- Keep UI states predictable; handle loading, empty, and error states.
- Build accessible interfaces by default (semantic HTML, ARIA when needed).
- Keep interactions consistent; reduce surprise and friction.

## Code Quality & Maintainability
- Optimize for readability and testability.
- Keep functions and modules small and focused.
- Avoid hidden side effects; prefer pure functions where practical.
- Use meaningful names; avoid cleverness.

## Testing & Quality
- Tests should cover critical paths and edge cases.
- Prefer deterministic tests; isolate external dependencies.
- Test behavior, not implementation details.
- Maintain a healthy test pyramid (unit > integration > e2e).

## SRE & Operational Excellence
- Build for observability: logs, metrics, traces.
- Automate deployments and rollbacks.
- Treat infrastructure as code and keep it auditable.
- Plan for failure: retries, timeouts, and graceful degradation.

## Security & Privacy
- Least privilege everywhere.
- Never trust client input.
- Protect secrets; rotate and audit access.
- Encrypt data in transit and at rest when applicable.

## Performance & Scalability
- Measure before optimizing.
- Set budgets for latency and resource usage.
- Cache deliberately and invalidate safely.
- Scale horizontally when feasible.

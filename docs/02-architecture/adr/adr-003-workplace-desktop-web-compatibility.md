# ADR-003: Workplace Desktop Web Compatibility

## Status

Accepted

## Date

2026-05-15

## Context

Tiku users may access the system from workplace desktop computers inside tobacco organizations. These environments can include ordinary office PCs, managed browsers, private networks, and lower-spec machines.

The current project scope does not require strict domestic IT certification. The architecture should support reliable Web delivery for workplace desktop environments without changing the core technology stack solely for a certification label.

The user boundary is practical workplace access: organization desktop users should be able to use the Web client comfortably. Other platform and hardware adaptation work should be driven by Tiku's product requirements, not by a broad domestic IT compatibility program.

## Decision

Tiku targets workplace desktop Web compatibility, not strict Xinchuang certification.

The project will:

- Prioritize reliable access from modern Chromium and Microsoft Edge desktop browsers on ordinary workplace PCs.
- Keep admin-side Web pages desktop-first while remaining usable on lower-spec office machines.
- Keep core user paths independent of 3D effects, large-area animations, WebGPU, and WebGL.
- Avoid unnecessary experimental browser APIs in required workflows.
- Avoid actively blocking a future private or internal network deployment path.

The project will not:

- Require domestic database certification in MVP.
- Require domestic OS or CPU certification in MVP.
- Replace PostgreSQL solely for Xinchuang labeling.
- Claim certified compatibility or customer acceptance without a separate customer-specific review.
- Treat broad domestic IT ecosystem adaptation as an MVP target.
- Design the deployment topology, security boundary, or network policy in this ADR.

## Consequences

- Product needs and maintainability stay primary.
- Browser compatibility and performance are quality concerns.
- Future private or internal network deployment remains possible at the architecture level, but deployment topology, security boundaries, and network policies require separate design.
- This ADR does not change the TypeScript, Next.js, and PostgreSQL technology stack selected by ADR-001.
- This ADR does not change the REST API and Server Actions layering contract defined by ADR-002.
- Strict certification or customer-specific compatibility requirements, if requested by a customer, get a separate ADR.

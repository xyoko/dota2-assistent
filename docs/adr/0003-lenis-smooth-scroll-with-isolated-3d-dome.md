# 0003. Lenis Smooth Scrolling with Isolated 3D Dome Interaction

Date: 2026-10-17
Status: Accepted

## Context

Global smooth scrolling using Lenis provides a luxury, tactile feel across long dashboard views. However, horizontal 3D carousels (such as the Orbital Hero Vault) and interactive WebGL canvases suffer when the window scroll hijacks mouse wheel events. Users scrolling vertically over the 3D dome inadvertently moved the entire web page rather than rotating through the hero roster.

## Decision

1. Mount Lenis at the application root (`useLenis.ts` in `App.tsx`) with scroll resets synchronized to tab navigation.
2. Isolate the **Orbital Hero Vault** (`OrbitalHeroVault.tsx`) and **Dome Gallery** (`DomeGallery.tsx`) using `data-lenis-prevent="true"`.
3. Attach non-passive (`{ passive: false }`) wheel event interceptors directly to the dome container that call `e.preventDefault()` and convert mouse wheel delta into horizontal conveyor scrolling and 3D spherical rotation.
4. Suppress all native browser scrollbars on the dome via `.no-scrollbar`.

## Consequences

- Smooth page-level scrolling across all normal surfaces.
- Frictionless, zero-lag internal wheel rotation on the 3D Hero Vault without page jumpiness.
- Clean visual aesthetic free of horizontal scrollbar clutter.

# AGENTS.md

## Project Overview

Orbit Simulator is a Vite + React + TypeScript application for real-time orbital mechanics and cinematic space visualization.
It combines multiple physics execution paths:

- CPU integrator
- Web Worker physics
- WebGPU physics
- prediction worker for orbit previews

Recent work added a scripted supernova scenario, cinematic camera control, layered VFX, and basic regression tests for physics and scenario helpers.

## Setup

Requirements:

- Node.js 18+
- npm

Install dependencies:

```bash
npm install
```

Start local development:

```bash
npm run dev
```

Local development is served under `/orbit_simulator/` unless `VERCEL` is set. Use:

- [vite.config.ts](/C:/Users/yngsw/dev/orbit-simulator/vite.config.ts)
- [README.md](/C:/Users/yngsw/dev/orbit-simulator/README.md)

## Build And Validation

Run these before finishing a meaningful code change:

```bash
npm run lint
npm test
npm run build
```

Additional useful checks:

```bash
npm run type-check
npm run preview
```

CI currently builds with:

```bash
npm ci --legacy-peer-deps
npm run build
```

See:

- [package.json](/C:/Users/yngsw/dev/orbit-simulator/package.json)
- [.github/workflows/deploy.yml](/C:/Users/yngsw/dev/orbit-simulator/.github/workflows/deploy.yml)

## Architecture Map

Core runtime areas:

- [src/store/physicsStore.ts](/C:/Users/yngsw/dev/orbit-simulator/src/store/physicsStore.ts): main simulation state, preset loading, supernova scenario state, camera-related UI state
- [src/store/effectsStore.ts](/C:/Users/yngsw/dev/orbit-simulator/src/store/effectsStore.ts): transient VFX state, effect scheduling, cleanup
- [src/utils/physics.ts](/C:/Users/yngsw/dev/orbit-simulator/src/utils/physics.ts): CPU SoA integrator
- [src/workers/physicsWorkerManager.ts](/C:/Users/yngsw/dev/orbit-simulator/src/workers/physicsWorkerManager.ts): worker path state initialization and stepping
- [src/workers/predictionWorker.ts](/C:/Users/yngsw/dev/orbit-simulator/src/workers/predictionWorker.ts): orbit prediction simulation
- [src/gpu/GPUPhysicsEngine.ts](/C:/Users/yngsw/dev/orbit-simulator/src/gpu/GPUPhysicsEngine.ts): WebGPU compute implementation
- [src/components/scene/Scene.tsx](/C:/Users/yngsw/dev/orbit-simulator/src/components/scene/Scene.tsx): R3F scene composition and camera control
- [src/components/effects/EffectsLayer.tsx](/C:/Users/yngsw/dev/orbit-simulator/src/components/effects/EffectsLayer.tsx): transient visual effects mounting

Feature-specific files:

- [src/utils/starSystems.ts](/C:/Users/yngsw/dev/orbit-simulator/src/utils/starSystems.ts): presets, including `supernova`
- [src/utils/supernova.ts](/C:/Users/yngsw/dev/orbit-simulator/src/utils/supernova.ts): scenario timings and visual profile helpers
- [src/components/scene/SupernovaCinematicController.tsx](/C:/Users/yngsw/dev/orbit-simulator/src/components/scene/SupernovaCinematicController.tsx): scenario camera choreography
- [src/components/ui/SupernovaScenarioOverlay.tsx](/C:/Users/yngsw/dev/orbit-simulator/src/components/ui/SupernovaScenarioOverlay.tsx): overlay UI for countdown and completion actions

## Working Rules

### Physics changes must stay backend-consistent

If you change timestep handling, collision behavior, or initialization, review all of these together:

- [src/utils/physics.ts](/C:/Users/yngsw/dev/orbit-simulator/src/utils/physics.ts)
- [src/workers/physicsWorkerManager.ts](/C:/Users/yngsw/dev/orbit-simulator/src/workers/physicsWorkerManager.ts)
- [src/workers/predictionWorker.ts](/C:/Users/yngsw/dev/orbit-simulator/src/workers/predictionWorker.ts)
- [src/gpu/GPUPhysicsEngine.ts](/C:/Users/yngsw/dev/orbit-simulator/src/gpu/GPUPhysicsEngine.ts)
- [src/components/scene/OrbitPrediction.tsx](/C:/Users/yngsw/dev/orbit-simulator/src/components/scene/OrbitPrediction.tsx)
- [src/utils/physics.test.ts](/C:/Users/yngsw/dev/orbit-simulator/src/utils/physics.test.ts)

The project has already had bugs caused by CPU, worker, and prediction paths drifting apart.

### Supernova changes span both stores and UI

Do not change only the effect visuals. A supernova flow touches:

- [src/store/physicsStore.ts](/C:/Users/yngsw/dev/orbit-simulator/src/store/physicsStore.ts)
- [src/store/effectsStore.ts](/C:/Users/yngsw/dev/orbit-simulator/src/store/effectsStore.ts)
- [src/components/scene/SupernovaCinematicController.tsx](/C:/Users/yngsw/dev/orbit-simulator/src/components/scene/SupernovaCinematicController.tsx)
- [src/components/ui/SupernovaScenarioOverlay.tsx](/C:/Users/yngsw/dev/orbit-simulator/src/components/ui/SupernovaScenarioOverlay.tsx)
- [src/components/ui/BodyInspectorContent.tsx](/C:/Users/yngsw/dev/orbit-simulator/src/components/ui/BodyInspectorContent.tsx)
- [src/utils/supernova.test.ts](/C:/Users/yngsw/dev/orbit-simulator/src/utils/supernova.test.ts)

If you add delayed effects or timers, register and clear them through the timeout registry helpers rather than creating unmanaged `setTimeout` chains.

### Preserve deployment-critical headers and base path

SharedArrayBuffer-dependent paths rely on COOP/COEP headers. Do not remove these casually:

- [vite.config.ts](/C:/Users/yngsw/dev/orbit-simulator/vite.config.ts)
- [vercel.json](/C:/Users/yngsw/dev/orbit-simulator/vercel.json)

Also keep the `base` behavior aligned with GitHub Pages vs Vercel.

### Keep benchmark hooks development-only

Benchmark utilities must stay gated behind `import.meta.env.DEV`. Do not reintroduce eager production imports or `window` exports for benchmark helpers.

Reference:

- [src/App.tsx](/C:/Users/yngsw/dev/orbit-simulator/src/App.tsx)
- [src/utils/benchmark.ts](/C:/Users/yngsw/dev/orbit-simulator/src/utils/benchmark.ts)

### Avoid generated output edits

Do not manually edit:

- `dist/`
- `tmp/`
- generated build artifacts

## Code Style

Use the repo’s existing conventions:

- TypeScript with `strict: true`
- React function components and hooks
- Zustand selectors instead of broad store reads when possible
- Existing style uses semicolons sparingly; follow the surrounding file
- No Prettier setup is present, so keep diffs stylistically consistent with nearby code

Lint/type constraints come from:

- [eslint.config.js](/C:/Users/yngsw/dev/orbit-simulator/eslint.config.js)
- [tsconfig.app.json](/C:/Users/yngsw/dev/orbit-simulator/tsconfig.app.json)

## Directory Notes

High-signal folders:

- [src/components](/C:/Users/yngsw/dev/orbit-simulator/src/components): scene, VFX, UI
- [src/store](/C:/Users/yngsw/dev/orbit-simulator/src/store): global app state
- [src/utils](/C:/Users/yngsw/dev/orbit-simulator/src/utils): physics helpers, presets, i18n, camera transitions
- [src/workers](/C:/Users/yngsw/dev/orbit-simulator/src/workers): background simulation and prediction
- [src/gpu](/C:/Users/yngsw/dev/orbit-simulator/src/gpu): WebGPU physics path
- [docs](/C:/Users/yngsw/dev/orbit-simulator/docs): implementation plans and review notes

## Change Checklist

Before closing a task, verify:

1. `npm run lint` passes.
2. `npm test` passes.
3. `npm run build` passes.
4. If physics or prediction changed, backend parity was checked.
5. If preset or VFX timing changed, timeout cleanup still works across preset reload and reset flows.

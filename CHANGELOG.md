# Changelog

All notable changes to this project will be documented in this file.

## [0.3.0] - 2025-12-28

### Features
- **Energy Monitoring**: Real-time tracking of Kinetic and Potential energy with Drift (Error) calculation to verify physics stability.
- **Performance Stats**: Enhanced UI to show simulation mode (CPU/Worker/GPU), detailed energy breakdown, and error rates.
- **Hybrid Engine**: Optimized architecture supporting dynamic switching between Single-threaded, Multi-threaded, and WebGPU physics engines.

### Improvements
- **Lazy Initialization**: reduced initial load time by deferring Worker and GPU engine instantiation until needed.
- **Resource Management**: Implemented strict `cleanup` routines to prevent memory leaks when switching modes or unmounting components.
- **Constants**: Centralized physics constants (`src/constants/physics.ts`) for better maintainability.

### Fixes
- Fixed orbit line thickness consistency across zoom levels (Week 2).
- Resolved camera control issues in Locked modes (Week 2).

## [0.2.1] - 2025-12-14
- Initial Beta Release with basic Physics/Worker support.

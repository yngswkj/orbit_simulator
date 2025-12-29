# Orbit Simulator (Solar System & N-Body Physics)

A real-time 3D orbit simulator built with **React**, **TypeScript**, **Three.js** (`@react-three/fiber`), and **Zustand**. It features accurate orbital mechanics, dynamic time scaling, and WebGPU/WebWorker support for performance.

## Getting Started (Local Development)

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/orbit-simulator.git
    cd orbit-simulator
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running Locally

To start the development server:

```bash
npm run dev
```

Open your browser and navigate to:

**[http://localhost:5173/orbit_simulator/](http://localhost:5173/orbit_simulator/)**

*(Note: The base path `/orbit_simulator/` is configured in `vite.config.ts`. If you see a blank page at root `/`, verify you are using the correct path.)*

## Features

- **Accurate Physics**: Simulates N-body gravitational interactions.
- **Multiple Views**: Free Camera, Sun-Lock, Surface-Lock, and Orbit-Fixed modes.
- **Distance Modes**:
  - **Compressed**: Easier to see planets properly.
  - **Realistic**: True-to-scale distances (with auto-adjusted time scaling).
- **Performance**:
  - **CPU**: Standard calculations.
  - **WebWorker**: Multithreaded calculations for no UI blocking.
  - **WebGPU**: Massive parallelism for thousands of bodies (experimental).
- **Visualization**:
  - Gravity Heatmap (visualize gravitational potential).
  - Orbit Trails & Predictions.
  - Habitable Zones.

## Tech Stack

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [react-three-fiber](https://docs.pmnd.rs/react-three-fiber)
- [Zustand](https://zustand-demo.pmnd.rs/) (State Management)

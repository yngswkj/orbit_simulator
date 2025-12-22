# Orbit Simulator Walkthrough

## What was built
We have built a 3D celestial orbit simulator using React, Three.js (R3F), and a custom physics engine.

### Core Features
- **N-Body Physics**: Newtonian gravity simulation using a simplified symplectic integrator.
- **Interactive 3D Scene**:
  - OrbitControls for rotating and zooming the view.
  - Starfield background.
  - **Enhanced Visual Trails**: Thick, clear trails showing the path of celestial bodies.
  - **Orbit Prediction**: Real-time forecast lines showing the future path of bodies for the next few hundred simulation steps.
  - **Spatial Reference**: Infinite grid and 3D axis visualization (Gizmo) for better orientation.
  - **Billboarding Labels**: Planet names always face the camera.
- **UI Control Overlay**:
  - **Simulation Control**: Pause/Resume and Time Scale slider (0.1x to 5.0x).
  - **Solar System Preset**: One-click button to load a scaled model of our Solar System.
  - **Body Creator**: Form to add new planets with custom mass, radius, color, position, and velocity.
  - **Body List**: Real-time list of objects with a delete button.
  - **Responsive Layout**: Full-screen immersive view with a collapsible sidebar.

## Verification
- **Visuals**:
    - **Trails**: Verified trails are clearly visible from a distance.
    - **Prediction**: Verified thin lines appear ahead of moving bodies, predicting their path.
    - **Grid**: Verified grid and XYZ axes gizmo are visible.
- **Physics**: Verified stable Solar System preset.
- **UI**: Verified all controls function as expected.

## How to Run
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
